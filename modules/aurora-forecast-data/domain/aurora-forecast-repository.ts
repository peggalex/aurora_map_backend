import { AuroraForecast } from "./aurora-forecast";

export interface IAuroraForecastRepository {
	saveAuroraForecast(aggregate: AuroraForecast): Promise<void>;
	getMostCurrentAuroraForecast(): Promise<AuroraForecast | null>;
	getAuroraForecastsSinceDate(startDate: Date): Promise<AuroraForecast[]>;
}
