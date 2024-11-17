import { MongoRepository } from "../../shared/mongo-repository";
import { IAuroraForecastRepository } from "../domain/aurora-forecast-repository";
import { AuroraGeoJson } from "../domain/value-objects/aurora-geojson";
import { AuroraForecast } from "../domain/aurora-forecast";
import { AuroraForecastMongoModel } from "./models/aurora-forecast-mongo-model";
import { ObjectId, WithId } from "mongodb";
import { logTime, logTimeSync } from "../../shared/log-time";

export class AuroraForecastMongoRepository
  extends MongoRepository<AuroraForecast, AuroraForecastMongoModel>
  implements IAuroraForecastRepository
{
  collectionName = "auroraForecasts";

  static async init(mongoConnectionStr: string) {
    const repo = new AuroraForecastMongoRepository(mongoConnectionStr);
    await repo.connectToDB(async (collection) => {
      await collection.createIndex({ forecastTime: 1 });
      await collection.createIndex({ geoJson: "2dsphere" });
    }); // idempotent
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
    const forecast = logTimeSync(
      {
        callback: () =>
          new AuroraForecast(
            document.id,
            document.forecastTime,
            document.observationTime,
            document.geoJson
          ),
        taskName: "generate aurora forecast",
        context: { forecastTime: document.forecastTime },
      },
      1
    );
    return forecast;
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

  async getForecastForLocation({
    lat,
    long,
    startDate,
  }: {
    lat: number;
    long: number;
    startDate: Date;
  }): Promise<
    {
      forecastTime: Date;
      auroraChance: number;
    }[]
  > {
    const forecast = await logTime({
      callback: () =>
        this.connectToDB(async (collection) => {
          const forecast = collection.aggregate([
            {
              $match: {
                forecastTime: { $gte: startDate },
              },
            },
            {
              $project: {
                properties: "$geoJson.features.properties",
                forecastTime: 1,
              },
            },
            {
              $unwind: {
                path: "$properties",
              },
            },
            {
              $match: {
                "properties.lat": {
                  $eq: lat,
                },
                "properties.long": {
                  $eq: long,
                },
              },
            },
            {
              $project: {
                forecastTime: 1,
                auroraChance: "$properties.aurora",
              },
            },
            {
              $sort: {
                forecastTime: 1,
              },
            },
          ]);

          return (await forecast.toArray()) as {
            forecastTime: Date;
            auroraChance: number;
          }[];
        }),
      taskName: "aggregation forecast query",
      context: {},
    });
    return forecast;
  }

  async getAuroraForecastsSinceDate(
    startDate: Date
  ): Promise<AuroraForecast[]> {
    return this.connectToDB(async (collection) => {
      /*console.log(
				`\t[${new Date().toLocaleString()}]fetching from mongo`
			);*/
      const cursor = collection.find(
        {
          forecastTime: { $gte: startDate },
        },
        {
          sort: {
            _id: 1,
          },
        }
      );
      const auroraForecasts: AuroraForecast[] = [];
      while (await cursor.hasNext()) {
        const doc = await logTime(
          {
            callback: () => cursor.next(),
            taskName: "cursor.next",
            context: {},
          },
          1
        );
        auroraForecasts.push(this.fromDocument(doc!));
      }
      //console.log(`\t[${new Date().toLocaleString()}]fetched from mongo`);
      return auroraForecasts;
    });
  }
}
