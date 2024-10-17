import { MongoRepository } from "../../shared/mongo-repository";
import { IAuroraForecastRepository } from "../domain/aurora-forecast-repository";
import { AuroraGeoJson } from "../domain/value-objects/aurora-geojson";
import { AuroraForecast } from "../domain/aurora-forecast";
import { AuroraForecastMongoModel } from "./models/aurora-forecast-mongo-model";
import { ObjectId, WithId } from "mongodb";

export class AuroraForecastMongoRepository
	extends MongoRepository<AuroraForecast, AuroraForecastMongoModel>
	implements IAuroraForecastRepository
{
	dbName = "auroraMap";
	collectionName = "auroraForecasts";

	toDocument(auroraForecast: AuroraForecast): AuroraForecastMongoModel {
		return {
			id: auroraForecast.id,
			forecastTime: auroraForecast.forecastTime,
			observationTime: auroraForecast.observationTime,
			geoJson: auroraForecast.geoJson,
		};
	}

	fromDocument(document: WithId<AuroraForecastMongoModel>): AuroraForecast {
		return new AuroraForecast(
			document.id,
			document.forecastTime,
			document.observationTime,
			document.geoJson
		);
	}

	async saveAuroraForecast(auroraForecast: AuroraForecast) {
		await this.updateDocument(auroraForecast.id, auroraForecast);
	}

	async getLatestAuroraForecast(): Promise<AuroraForecast | null> {
		return await this.getLatest();
	}
}
