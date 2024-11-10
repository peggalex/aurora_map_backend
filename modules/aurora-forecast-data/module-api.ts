import { GetAuroraForecastForLocationRequest } from "./application/queries/get-aurora-forecast-for-location";
import {
	ReadAuroraForecast,
	ReadAuroraForecastTimeSeries,
} from "./application/read-models";

export interface IAuroraForecastDataModuleApi {
	getCurrentAuroraForecast(): Promise<ReadAuroraForecast | null>;
	getAuroraForecastForLocation(
		request: GetAuroraForecastForLocationRequest
	): Promise<ReadAuroraForecastTimeSeries>;
}
