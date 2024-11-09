import { getFetchWithRetry } from "../../shared/fetch-with-retry";
import { IModuleQueryCommand } from "../../shared/module";
import { WeatherApiSearchData } from "../domain/value-objects/weather-api-search-data";
import { ReadAutoCompleteLocations } from "./read-models";

export type AutoCompleteLocationSearchRequest = {
	searchTerm: string;
};

const fetchWithRetry = getFetchWithRetry(5);

export class AutoCompleteLocationSearchQuery implements IModuleQueryCommand {
	constructor(private weatherApiKey: string) {}

	async execute(
		request: AutoCompleteLocationSearchRequest
	): Promise<ReadAutoCompleteLocations | null> {
		const weatherApiUrl = (() => {
			const url = new URL("http://api.weatherapi.com/v1/search.json");
			url.searchParams.append("key", this.weatherApiKey);
			url.searchParams.append("q", `${request.searchTerm}`);
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
					WeatherApiSearchData.fromRaw(data);
				return this.weatherApiSearchDataToReadModel(
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

	weatherApiSearchDataToReadModel(
		searchData: WeatherApiSearchData
	): ReadAutoCompleteLocations {
		return searchData.datums.map((datum) => ({
			name: datum.name ?? null,
			country: datum.country ?? null,
			region: datum.region ?? null,
			lat: datum.lat,
			long: datum.long,
		}));
	}
}
