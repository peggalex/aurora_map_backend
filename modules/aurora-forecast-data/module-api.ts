import { ReadAuroraForecast } from "./application/read-models";

export interface IAuroraForecastDataModuleApi {
	getCurrentAuroraForecast(): Promise<ReadAuroraForecast | null>;
}
