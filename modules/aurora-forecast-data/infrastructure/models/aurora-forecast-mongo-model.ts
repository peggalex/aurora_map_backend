import { UUID } from "crypto";
import { AuroraGeoJson } from "../../domain/value-objects/aurora-geojson";
import { Document } from "mongodb";

export interface AuroraForecastMongoModel extends Document {
	id: UUID;
	forecastTime: Date;
	observationTime: Date;
	geoJson: AuroraGeoJson;
}
