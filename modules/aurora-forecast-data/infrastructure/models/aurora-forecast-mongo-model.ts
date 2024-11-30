import { UUID } from "crypto";
import { Document } from "mongodb";

export type LongLatStr = `${number},${number}`;
export interface AuroraForecastMongoModel extends Document {
	id: UUID;
	forecastTime: Date;
	observationTime: Date;
	coordinateToAuroraChance: {
		[key: LongLatStr]: number;
	};
}
