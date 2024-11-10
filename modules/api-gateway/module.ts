import express, { Express, NextFunction, Request, Response } from "express";
import { IAuroraForecastDataModuleApi } from "../aurora-forecast-data/module-api";
import { IWeatherForecastApi as IWeatherForecastModuleApi } from "../weather-forecast/module-api";
import { GetCurrentWeatherForecastRequest } from "./domain/value-objects/get-current-weather-forecast-request";
import cors from "cors";
import { ILocationLookupApi as ILocationLookupModuleApi } from "../location-lookup/module-api";
import { AutoCompleteLocationSearchRequest } from "./domain/value-objects/auto-complete-location-search-request";
import { GetAuroraChanceForLocationRequest } from "./domain/value-objects/get-aurora-chance-for-location-request";

export class ApiGatewayModule {
	private static singleton:
		| { type: "NOT_INITIALIZED" }
		| { type: "INITIALIZING" }
		| { type: "INITIALIZED"; instance: ApiGatewayModule } = {
		type: "NOT_INITIALIZED",
	};

	private constructor(private app: Express) {}

	/**
	 * Initialize module instance
	 */
	static async init(
		auroraForecastDataModule: IAuroraForecastDataModuleApi,
		weatherForecastModule: IWeatherForecastModuleApi,
		locationLookupModule: ILocationLookupModuleApi
	) {
		if (ApiGatewayModule.singleton.type !== "NOT_INITIALIZED") {
			throw Error(
				`Already started initializing AuroraForecastDataModule`
			);
		}
		ApiGatewayModule.singleton = {
			type: "INITIALIZING",
		};
		const instance = await ApiGatewayModule.createInstance(
			auroraForecastDataModule,
			weatherForecastModule,
			locationLookupModule
		);
		ApiGatewayModule.singleton = {
			type: "INITIALIZED",
			instance,
		};
		return instance;
	}

	private static async createInstance(
		auroraForecastDataModule: IAuroraForecastDataModuleApi,
		weatherForecastModule: IWeatherForecastModuleApi,
		locationLookupModule: ILocationLookupModuleApi
	): Promise<ApiGatewayModule> {
		const logger = {
			info: (msg: string) =>
				console.log(`[${new Date().toLocaleTimeString()}] ${msg}`),
		};

		const app: Express = express();
		const port = 3000;

		app.use(cors());

		app.get("/", (req: Request, res: Response) => {
			res.send("Express + TypeScript Server");
		});

		app.get(
			"/get-current-aurora-forecast",
			async (req: Request, res: Response, next: NextFunction) => {
				try {
					const currentAuroraForecast =
						await auroraForecastDataModule.getCurrentAuroraForecast();
					res.json(currentAuroraForecast);
					res.status(currentAuroraForecast === null ? 404 : 200);
				} catch (e) {
					next(e);
				}
			}
		);

		app.get(
			"/get-current-weather-forecast",
			async (req: Request, res: Response, next: NextFunction) => {
				try {
					console.log(req.query);
					const request = GetCurrentWeatherForecastRequest.fromRaw(
						req.query as any
					);
					const currentWeatherForecast =
						await weatherForecastModule.getCurrentWeatherForecast({
							longitude: request.longitude,
							latitude: request.latitude,
						});
					res.json(currentWeatherForecast);
					res.status(200);
				} catch (e) {
					next(e);
				}
			}
		);

		app.get(
			"/auto-complete-location-search",
			async (req: Request, res: Response, next: NextFunction) => {
				try {
					console.log(req.query);
					const request = AutoCompleteLocationSearchRequest.fromRaw(
						req.query as any
					);
					const autoCompleteLocations =
						await locationLookupModule.autoCompleteLocationSearch({
							searchTerm: request.searchTerm,
						});
					res.json(autoCompleteLocations);
					res.status(200);
				} catch (e) {
					next(e);
				}
			}
		);

		app.get(
			"/aurora-chance-for-location",
			async (req: Request, res: Response, next: NextFunction) => {
				try {
					console.log(req.query);
					const request = GetAuroraChanceForLocationRequest.fromRaw(
						req.query as any
					);
					const auroraForecastForLocation =
						await auroraForecastDataModule.getAuroraForecastForLocation(
							{
								lat: request.lat,
								long: request.long,
								startDate: request.timestamp.valueOf(),
							}
						);
					res.json(auroraForecastForLocation);
					res.status(200);
				} catch (e) {
					next(e);
				}
			}
		);

		app.use(
			(err: Error, req: Request, res: Response, next: NextFunction) => {
				console.log("got error");
				console.error(err.stack);
				res.status(500).send("Something broke!");
			}
		);
		app.listen(port, () => {
			console.log(
				`[server]: Server is running at http://localhost:${port}`
			);
		});

		return new ApiGatewayModule(app);
	}
}
