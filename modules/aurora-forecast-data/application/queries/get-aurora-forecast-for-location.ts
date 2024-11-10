import { IModuleQueryCommand } from "../../../shared/module";
import { IAuroraForecastRepository } from "../../domain/aurora-forecast-repository";
import { AuroraChanceForLocationService } from "../../domain/services/aurora-chance-for-location";
import { ReadAuroraForecastTimeSeries } from "../read-models";

export type GetAuroraForecastForLocationRequest = {
	lat: number;
	long: number;
	startDate: number;
};

export class GetAuroraForecastForLocationQuery implements IModuleQueryCommand {
	constructor(
		private repository: IAuroraForecastRepository,
		private auroraChanceForLocationService: AuroraChanceForLocationService
	) {}

	async execute(
		request: GetAuroraForecastForLocationRequest
	): Promise<ReadAuroraForecastTimeSeries> {
		const forecasts = await this.repository.getAuroraForecastsSinceDate(
			new Date(request.startDate)
		);
		return {
			context: {
				lat: request.lat,
				long: request.long,
				timestamp: request.startDate,
			},
			forecast: forecasts.map((forecast) => ({
				timestamp: forecast.forecastTime.valueOf(),
				auroraChance:
					this.auroraChanceForLocationService.getChance({
						lat: request.lat,
						long: request.long,
						forecastGeoJson: forecast.geoJson,
					}) ?? 0,
			})),
		};
	}
}
