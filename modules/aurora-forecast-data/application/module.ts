import { CronJob } from "cron";
import { DataPullProcesser } from "./jobs/pull-data-processor";
import { CronTime } from "cron-time-generator";
import { AuroraForecastMongoRepository } from "../infrastructure/aurora-forecast-mongo-repo";
import { GetAuroraForecastQuery } from "./queries/get-aurora-forecast";

export class AuroraForecastDataModule {
	private static singleton:
		| { type: "NOT_INITIALIZED" }
		| { type: "INITIALIZING" }
		| { type: "INITIALIZED"; instance: AuroraForecastDataModule } = {
		type: "NOT_INITIALIZED",
	};

	private constructor(
		private dataPullJob: CronJob<any, any>,
		private getAuroraForecastQuery: GetAuroraForecastQuery
	) {}

	/**
	 * Initialize module instance
	 */
	static async init() {
		if (AuroraForecastDataModule.singleton.type !== "NOT_INITIALIZED") {
			throw Error(
				`Already started initializing AuroraForecastDataModule`
			);
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
		const auroraForecastRepository = new AuroraForecastMongoRepository();

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
			new GetAuroraForecastQuery(auroraForecastRepository)
		);
	}

	getDataPullJob() {
		return this.dataPullJob;
	}

	getLatestAuroraForecast() {
		return this.getAuroraForecastQuery.execute({});
	}
}
