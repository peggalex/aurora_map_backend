import { AutoCompleteLocationSearchRequest } from "./application/auto-complete-location-search";
import { ReadAutoCompleteLocations } from "./application/read-models";

export interface ILocationLookupApi {
	autoCompleteLocationSearch(
		request: AutoCompleteLocationSearchRequest
	): Promise<ReadAutoCompleteLocations | null>;
}
