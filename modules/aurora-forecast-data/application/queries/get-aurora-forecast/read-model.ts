import { UUID } from "crypto";
import { JsonSerializable } from "../../../../shared/types/JsonSerializable";

export type AuroraForecastReadModel = {
	id: UUID;
	forecastTime: string;
	observationTime: string;
	geoJson: JsonSerializable;
};
