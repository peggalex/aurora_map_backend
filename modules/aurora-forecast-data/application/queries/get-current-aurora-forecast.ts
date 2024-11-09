import { IModuleQueryCommand } from "../../../shared/module";
import { JsonSerializable } from "../../../shared/types/JsonSerializable";
import { IAuroraForecastRepository } from "../../domain/aurora-forecast-repository";
import { ReadAuroraForecast } from "../read-models";

export class GetCurrentAuroraForecastQuery implements IModuleQueryCommand {
	constructor(private repository: IAuroraForecastRepository) {}

	async execute(_request: {}): Promise<ReadAuroraForecast | null> {
		const auroraForecast =
			await this.repository.getMostCurrentAuroraForecast();
		if (!auroraForecast) {
			return null;
		}
		return {
			id: auroraForecast.id,
			forecastTime: auroraForecast.forecastTime.toISOString(),
			observationTime: auroraForecast.forecastTime.toISOString(),
			geoJson: auroraForecast.geoJson as any as JsonSerializable, // it's an interface so it isn't json serializable by default
		};
	}
}
