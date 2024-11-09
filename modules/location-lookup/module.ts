import {
	AutoCompleteLocationSearchQuery,
	AutoCompleteLocationSearchRequest,
} from "./application/auto-complete-location-search";
import { ILocationLookupApi } from "./module-api";

export class LocationLookupModule implements ILocationLookupApi {
	private static singleton:
		| { type: "NOT_INITIALIZED" }
		| { type: "INITIALIZING" }
		| { type: "INITIALIZED"; instance: LocationLookupModule } = {
		type: "NOT_INITIALIZED",
	};

	private constructor(
		private autoCompleteLocationSearchQuery: AutoCompleteLocationSearchQuery
	) {}

	/**
	 * Initialize module instance
	 */
	static init(): ILocationLookupApi {
		if (LocationLookupModule.singleton.type !== "NOT_INITIALIZED") {
			throw Error(`Already started initializing LocationLookupModule`);
		}
		const instance = LocationLookupModule.createInstance();
		LocationLookupModule.singleton = {
			type: "INITIALIZED",
			instance,
		};
		return instance;
	}

	private static createInstance(): LocationLookupModule {
		const weatherApiKey = process.env.WEATHER_API_KEY;
		if (!weatherApiKey) {
			throw Error("Expected weather api key in env vars");
		}

		return new LocationLookupModule(
			new AutoCompleteLocationSearchQuery(weatherApiKey)
		);
	}

	autoCompleteLocationSearch(request: AutoCompleteLocationSearchRequest) {
		return this.autoCompleteLocationSearchQuery.execute(request);
	}
}
