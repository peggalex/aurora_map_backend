import { GetCurrentWeatherForecastRequest } from "./application/get-current-weather-forecast";
import { ReadWeatherForecast } from "./application/read-models";

export interface IWeatherForecastApi {
	getCurrentWeatherForecast(
		request: GetCurrentWeatherForecastRequest
	): Promise<ReadWeatherForecast | null>;
}
