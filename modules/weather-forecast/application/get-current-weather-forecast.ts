import { getFetchWithRetry } from "../../shared/fetch-with-retry";
import { IModuleQueryCommand } from "../../shared/module";
import { WeatherApiCurrentData } from "../domain/value-objects/weather-api-current-data";
import { ReadWeatherForecast } from "./read-models";

export type GetCurrentWeatherForecastRequest = {
	latitude: number;
	longitude: number;
};

const fetchWithRetry = getFetchWithRetry(5);

export class GetCurrentWeatherForecastQuery implements IModuleQueryCommand {
	constructor(private weatherApiKey: string) {}

	async execute(
		request: GetCurrentWeatherForecastRequest
	): Promise<ReadWeatherForecast | null> {
		const weatherApiUrl = (() => {
			const url = new URL("https://api.weatherapi.com/v1/current.json");
			url.searchParams.append("key", this.weatherApiKey);
			url.searchParams.append(
				"q",
				`${request.latitude},${request.longitude}`
			);
			return url;
		})();

		const response = await fetchWithRetry([weatherApiUrl]);
		const data = await response.json();
		console.log({
			weatherApiUrl,
			status: response.status,
			body: JSON.stringify(data),
		});
		switch (response.status) {
			case 200:
				const weatherApiCurrentData =
					WeatherApiCurrentData.fromRaw(data);
				return this.weatherApiCurrentDataToReadModel(
					weatherApiCurrentData
				);
			case 400: {
				console.warn(
					`Weather API returned 400: ${JSON.stringify(data)}`
				);
				return null;
			}
			default:
				throw Error(
					`Unexpected Weather API status code ${response.status}`
				);
		}
	}

	weatherApiCurrentDataToReadModel({
		location,
		forecastTime,
		cloudCoverage,
		visibilityKm,
	}: WeatherApiCurrentData): ReadWeatherForecast {
		return {
			location: {
				name: location.name ?? null,
				region: location.region ?? null,
				country: location.country ?? null,
				latitude: location.lat,
				longitude: location.lon,
			},
			forecastTime: forecastTime.toISOString(),
			cloudCoverage,
			visibilityKm,
		};
	}
}
