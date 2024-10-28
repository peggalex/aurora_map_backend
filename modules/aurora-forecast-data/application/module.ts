import { CronJob } from "cron";
import { DataPullProcesser } from "./jobs/pull-data-processor";
import { CronTime } from "cron-time-generator";
import { AuroraForecastMongoRepository } from "../infrastructure/aurora-forecast-mongo-repo";
import { GetCurrentAuroraForecastQuery } from "./queries/get-current-aurora-forecast";
import { IAuroraForecastDataModuleApi } from "./module-api";

export class AuroraForecastDataModule implements IAuroraForecastDataModuleApi {
  private static singleton:
    | { type: "NOT_INITIALIZED" }
    | { type: "INITIALIZING" }
    | { type: "INITIALIZED"; instance: AuroraForecastDataModule } = {
    type: "NOT_INITIALIZED",
  };

  private constructor(
    private dataPullJob: CronJob<any, any>,
    private getAuroraForecastQuery: GetCurrentAuroraForecastQuery
  ) {}

  /**
   * Initialize module instance
   */
  static async init(): Promise<IAuroraForecastDataModuleApi> {
    if (AuroraForecastDataModule.singleton.type !== "NOT_INITIALIZED") {
      throw Error(`Already started initializing AuroraForecastDataModule`);
    }
    AuroraForecastDataModule.singleton = {
      type: "INITIALIZING",
    };
    const instance = await AuroraForecastDataModule.createInstance();
    AuroraForecastDataModule.singleton = {
      type: "INITIALIZED",
      instance,
    };
    return instance;
  }

  private static async createInstance(): Promise<AuroraForecastDataModule> {
    const logger = {
      info: (msg: string) =>
        console.log(`[${new Date().toLocaleTimeString()}] ${msg}`),
    };
    const auroraForecastRepository = await AuroraForecastMongoRepository.init();

    const dataPullProcess = new DataPullProcesser(
      auroraForecastRepository,
      logger
    );

    const dataPullJob = new CronJob(
      CronTime.every(5).minutes(),
      async () => dataPullProcess.process(), // onTick
      () => console.log("Completed data pull"), // onComplete
      true // start
    );

    return new AuroraForecastDataModule(
      dataPullJob,
      new GetCurrentAuroraForecastQuery(auroraForecastRepository)
    );
  }

  getDataPullJob() {
    return this.dataPullJob;
  }

  getCurrentAuroraForecast() {
    return this.getAuroraForecastQuery.execute({});
  }
}
