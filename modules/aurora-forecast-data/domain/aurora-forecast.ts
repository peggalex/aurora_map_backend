import { randomUUID, UUID } from "crypto";
import { AuroraGeoJson } from "./value-objects/aurora-geojson";

/**
 * Aurora Forecast aggregate
 */
export class AuroraForecast {
	constructor(
		readonly id: UUID,
		readonly forecastTime: Date,
		readonly observationTime: Date,
		readonly geoJson: AuroraGeoJson
	) {}

	static create({
		forecastTime,
		observationTime,
		geoJson,
	}: {
		forecastTime: Date;
		observationTime: Date;
		geoJson: AuroraGeoJson;
	}) {
		return new AuroraForecast(
			randomUUID(),
			forecastTime,
			observationTime,
			geoJson
		);
	}
}
