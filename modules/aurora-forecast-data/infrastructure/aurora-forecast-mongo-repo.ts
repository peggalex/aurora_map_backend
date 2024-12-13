import { MongoRepository } from "../../shared/mongo-repository";
import { IAuroraForecastRepository } from "../domain/aurora-forecast-repository";
import { IAuroraGeoFeature } from "../domain/value-objects/aurora-geojson";
import { AuroraForecast } from "../domain/aurora-forecast";
import {
  AuroraForecastMongoModel,
  LongLatStr,
} from "./models/aurora-forecast-mongo-model";
import { WithId } from "mongodb";
import { logTime, logTimeSync } from "../../shared/log-time";
import { objectFromEntriesTyped } from "../../shared/object-from-entries-typed";
import { GeoJsonService } from "../domain/services/geojson-service";

const featureToLongLatStr = (feature: IAuroraGeoFeature): LongLatStr =>
  createLongLatStr(feature.properties);

const createLongLatStr = ({
  long,
  lat,
}: {
  long: number;
  lat: number;
}): LongLatStr => `${Math.round(long)},${Math.round(lat)}`;

const parseLongLatStr = (str: LongLatStr) => {
  const [longStr, latStr] = str.split(",");
  return { long: Number(longStr), lat: Number(latStr) };
};

export class AuroraForecastMongoRepository
  extends MongoRepository<AuroraForecast, AuroraForecastMongoModel>
  implements IAuroraForecastRepository
{
  collectionName = "auroraForecasts";

  static async init(mongoConnectionStr: string) {
    const repo = new AuroraForecastMongoRepository(mongoConnectionStr);
    await repo.connectToDB(async (collection) => {
      await collection.createIndex({ forecastTime: 1 });
    }); // idempotent
    return repo;
  }

  toDocument(auroraForecast: AuroraForecast): AuroraForecastMongoModel {
    return {
      id: auroraForecast.id,
      forecastTime: auroraForecast.forecastTime,
      observationTime: auroraForecast.observationTime,
      coordinateToAuroraChance: objectFromEntriesTyped(
        auroraForecast.geoJson.features.map((f) => [
          featureToLongLatStr(f),
          f.properties.aurora,
        ])
      ),
    };
  }

  fromDocument(document: WithId<AuroraForecastMongoModel>): AuroraForecast {
    const forecast = logTimeSync(
      {
        callback: () => {
          const features = Object.entries(
            document.coordinateToAuroraChance
          ).map(([longLatStr, aurora], index): IAuroraGeoFeature => {
            const { long, lat } = parseLongLatStr(longLatStr as LongLatStr);
            return new GeoJsonService().getFeatureFromCoord({
              index,
              long,
              lat,
              aurora,
            });
          });

          return new AuroraForecast(
            document.id,
            document.forecastTime,
            document.observationTime,
            {
              type: "FeatureCollection",
              features,
            }
          );
        },
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
      const [document] = await collection
        .find({ forecastTime: { $lte: new Date() } })
        .sort({ _id: -1 })
        .limit(1)
        .toArray();
      if (!document) {
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
                forecastTime: 1,
                auroraChance: {
                  $ifNull: [
                    {
                      $getField: {
                        field: {
                          $literal: createLongLatStr({
                            long,
                            lat,
                          }),
                        },
                        input: "$coordinateToAuroraChance",
                      },
                    },
                    0,
                  ],
                },
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
        if (doc) {
          auroraForecasts.push(this.fromDocument(doc));
        }
      }
      //console.log(`\t[${new Date().toLocaleString()}]fetched from mongo`);
      return auroraForecasts;
    });
  }
}
