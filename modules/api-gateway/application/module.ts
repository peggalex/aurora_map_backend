import { CronJob } from "cron";
import { CronTime } from "cron-time-generator";

export class AuroraForecastDataModule {
	private static singleton:
		| { type: "NOT_INITIALIZED" }
		| { type: "INITIALIZING" }
		| { type: "INITIALIZED"; instance: AuroraForecastDataModule } = {
		type: "NOT_INITIALIZED",
	};

	private constructor() {}

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

		const app: Express = express();
		const port = 3000;

		app.get("/", (req: Request, res: Response) => {
			res.send("Express + TypeScript Server");
		});

		app.listen(port, () => {
			console.log(
				`[server]: Server is running at http://localhost:${port}`
			);
		});

		setTimeout(() => {
			const dataPullJob = modules.AuroraForecastData.getDataPullJob();
			console.log({
				lastExecuted: dataPullJob.lastExecution,
			});
		}, 5000);

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
