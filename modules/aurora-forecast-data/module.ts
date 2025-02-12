import { CronJob } from "cron";
import { DataPullProcessor } from "./application/jobs/pull-data-processor";
import { CronTime } from "cron-time-generator";
import { AuroraForecastMongoRepository } from "./infrastructure/aurora-forecast-mongo-repo";
import { GetCurrentAuroraForecastQuery } from "./application/queries/get-current-aurora-forecast";
import { IAuroraForecastDataModuleApi } from "./module-api";
import { ReadAuroraForecastTimeSeries } from "./application/read-models";
import {
	GetAuroraForecastForLocationQuery,
	GetAuroraForecastForLocationRequest,
} from "./application/queries/get-aurora-forecast-for-location";
import { AuroraChanceForLocationService } from "./domain/services/aurora-chance-for-location";

export class AuroraForecastDataModule implements IAuroraForecastDataModuleApi {
	private static singleton:
		| { type: "NOT_INITIALIZED" }
		| { type: "INITIALIZING" }
		| { type: "INITIALIZED"; instance: AuroraForecastDataModule } = {
		type: "NOT_INITIALIZED",
	};

	private constructor(
		private dataPullJob: CronJob<any, any>,
		private getAuroraForecastQuery: GetCurrentAuroraForecastQuery,
		private getAuroraForecastForLocationQuery: GetAuroraForecastForLocationQuery
	) {}

	/**
	 * Initialize module instance
	 */
	static async init(): Promise<IAuroraForecastDataModuleApi> {
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
			error: (msg: string) =>
				console.error(`[${new Date().toLocaleTimeString()}] ${msg}`),
		};
		const mongoConnectionStr = process.env.MONGO_CONNECTION_STR;
		if (!mongoConnectionStr) {
			throw Error("Expected mongo connection string in env vars");
		}
		const auroraForecastRepository =
			await AuroraForecastMongoRepository.init(mongoConnectionStr);

		const dataPullProcess = new DataPullProcessor(
			auroraForecastRepository,
			logger
		);

		const dataPullJob = new CronJob(
			CronTime.every(5).minutes(),
			async () => dataPullProcess.process(), // onTick
			() => console.log("Completed data pull"), // onComplete
			true // start
		);

		const auroraChanceForLocationService =
			new AuroraChanceForLocationService();

		return new AuroraForecastDataModule(
			dataPullJob,
			new GetCurrentAuroraForecastQuery(auroraForecastRepository),
			new GetAuroraForecastForLocationQuery(
				auroraForecastRepository,
				auroraChanceForLocationService
			)
		);
	}

	getDataPullJob() {
		return this.dataPullJob;
	}

	getCurrentAuroraForecast() {
		return this.getAuroraForecastQuery.execute({});
	}

	getAuroraForecastForLocation(request: GetAuroraForecastForLocationRequest) {
		return this.getAuroraForecastForLocationQuery.execute(request);
	}
}
