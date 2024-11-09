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
	collectionName = "auroraForecasts";

	static async init(mongoConnectionStr: string) {
		const repo = new AuroraForecastMongoRepository(mongoConnectionStr);
		await repo.connectToDB((collection) =>
			collection.createIndex({ forecastTime: 1 })
		); // idempotent
		return repo;
	}

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

	async getMostCurrentAuroraForecast(): Promise<AuroraForecast | null> {
		return this.connectToDB(async (collection) => {
			const document = await collection.findOne(
				{
					forecastTime: { $lte: new Date() },
				},
				{
					sort: {
						_id: -1,
					},
				}
			);
			if (document === null) {
				return null;
			}
			return this.fromDocument(document);
		});
	}
}
