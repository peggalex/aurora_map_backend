import {
	GetCurrentWeatherForecastQuery,
	GetCurrentWeatherForecastRequest,
} from "./application/get-current-weather-forecast";
import { IWeatherForecastApi } from "./module-api";

export class WeatherForecastModule implements IWeatherForecastApi {
	private static singleton:
		| { type: "NOT_INITIALIZED" }
		| { type: "INITIALIZING" }
		| { type: "INITIALIZED"; instance: WeatherForecastModule } = {
		type: "NOT_INITIALIZED",
	};

	private constructor(
		private getWeatherForecastQuery: GetCurrentWeatherForecastQuery
	) {}

	/**
	 * Initialize module instance
	 */
	static init(): IWeatherForecastApi {
		if (WeatherForecastModule.singleton.type !== "NOT_INITIALIZED") {
			throw Error(`Already started initializing WeatherForecastModule`);
		}
		const instance = WeatherForecastModule.createInstance();
		WeatherForecastModule.singleton = {
			type: "INITIALIZED",
			instance,
		};
		return instance;
	}

	private static createInstance(): WeatherForecastModule {
		const weatherApiKey = process.env.WEATHER_API_KEY;
		if (!weatherApiKey) {
			throw Error("Expected weather api key in env vars");
		}

		return new WeatherForecastModule(
			new GetCurrentWeatherForecastQuery(weatherApiKey)
		);
	}

	getCurrentWeatherForecast(request: GetCurrentWeatherForecastRequest) {
		return this.getWeatherForecastQuery.execute(request);
	}
}
