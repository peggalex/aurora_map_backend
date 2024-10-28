import { AuroraForecast } from "./aurora-forecast";

export interface IAuroraForecastRepository {
  saveAuroraForecast(aggregate: AuroraForecast): Promise<void>;
  getLatestAuroraForecast(): Promise<AuroraForecast | null>;
  getMostCurrentAuroraForecast(): Promise<AuroraForecast | null>;
}
