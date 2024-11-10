import { UUID } from "crypto";
import { JsonSerializable } from "../../shared/types/JsonSerializable";

export type ReadAuroraForecast = {
	id: UUID;
	forecastTime: string;
	observationTime: string;
	geoJson: JsonSerializable;
};

export type ReadAuroraForecastTimeSeries = {
	context: {
		lat: number;
		long: number;
		timestamp: number;
	};
	forecast: {
		auroraChance: number;
		timestamp: number;
	}[];
};
