import { logTime } from "../../../shared/log-time";
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
		console.log(
			`[${new Date().toLocaleString()}]generating aurora forecasts`
		);

		/*const forecasts = await logTime({
			callback: () =>
				this.repository.getAuroraForecastsSinceDate(
					new Date(request.startDate)
				),
			taskName: "Get all forecasts objs",
			context: request,
		});*/

		const formattedForecast = await logTime({
			callback: () =>
				this.repository.getForecastForLocation({
					lat: request.lat,
					long: request.long,
					startDate: new Date(request.startDate),
				}),
			taskName: "Get forecast for location",
			context: request,
		});

		/*console.log(
			`[${new Date().toLocaleString()}]generated aurora forecasts`
		);
		console.log({
			message: "\tending get aurora forecast since date",
			time: new Date().toLocaleString(),
		});

		console.log({
			message: "\tstarting get aurora chances",
			time: new Date().toLocaleString(),
		});
		const readForecast = forecasts.map((forecast) => ({
			timestamp: forecast.forecastTime.valueOf(),
			auroraChance: (() => {
				console.log({
					message: "\t\tstarting get aurora chance",
					time: new Date().toLocaleString(),
				});
				const auroraChance =
					this.auroraChanceForLocationService.getChance({
						lat: request.lat,
						long: request.long,
						forecastGeoJson: forecast.geoJson,
					}) ?? 0;
				console.log({
					message: "\t\tended get aurora chance",
					time: new Date().toLocaleString(),
				});
				return auroraChance;
			})(),
		}));
		console.log({
			message: "\tend get aurora chances",
			time: new Date().toLocaleString(),
		});*/

		return {
			context: {
				lat: request.lat,
				long: request.long,
				timestamp: request.startDate,
			},
			forecast: formattedForecast.map(
				({ auroraChance, forecastTime }) => ({
					auroraChance,
					timestamp: forecastTime.valueOf(),
				})
			),
		};
	}
}
