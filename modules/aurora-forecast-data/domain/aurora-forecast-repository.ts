import { AuroraForecast } from "./aurora-forecast";

export interface IAuroraForecastRepository {
	saveAuroraForecast(aggregate: AuroraForecast): Promise<void>;
	getMostCurrentAuroraForecast(): Promise<AuroraForecast | null>;
	getForecastForLocation({
		lat,
		long,
		startDate,
	}: {
		lat: number;
		long: number;
		startDate: Date;
	}): Promise<
		{
			forecastTime: Date;
			auroraChance: number;
		}[]
	>;
	getAuroraForecastsSinceDate(startDate: Date): Promise<AuroraForecast[]>;
}
