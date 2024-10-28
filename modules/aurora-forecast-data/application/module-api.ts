import { ReadAuroraForecast } from "./read-models";

export interface IAuroraForecastDataModuleApi {
  getCurrentAuroraForecast(): Promise<ReadAuroraForecast | null>;
}
