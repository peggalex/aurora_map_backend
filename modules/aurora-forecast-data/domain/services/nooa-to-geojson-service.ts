import {
  AuroraGeoJson,
  IAuroraGeoFeature,
} from "../value-objects/aurora-geojson";
import { AuroraNoaaData } from "../value-objects/aurora-noaa-data";
import { getBoundedValue } from "../../../shared/utilities";
import { AuroraForecast } from "../aurora-forecast";

export class NoaaToGeoJsonService {
  convert(noaaData: AuroraNoaaData): AuroraForecast {
    return AuroraForecast.create({
      forecastTime: noaaData.forecastTime,
      observationTime: noaaData.observationTime,
      geoJson: AuroraGeoJson.fromRaw({
        type: "FeatureCollection",
        /**
         * Iterate over each coordinate in NOAA data, creating a 1 x 1 square
         */
        features: noaaData.coordinates
          /**
           * Fiilter out entries with no aurora (optimization to reduce size)
           * Also filter out entries at [-1, 0, 1] latitute -- weird input from NOAA here
           */
          .filter(({ lat, aurora }) => aurora && Math.abs(lat) > 1)
          .flatMap(({ long180, lat, aurora }, index) => {
            const features = [
              getFeatureFromCoord({ index, aurora, lat, long: long180 }),
            ];
            if (long180 === -180) {
              features.push(
                getFeatureFromCoord({ index, aurora, lat, long: 180 })
              );
            }
            return features;
          }),
      }),
    });
  }
}

const getFeatureFromCoord = ({
  index,
  aurora,
  long,
  lat,
}: {
  index: number;
  aurora: number;
  long: number;
  lat: number;
}) => ({
  type: "Feature" as const,
  id: index.toString(),
  properties: {
    aurora,
    lat,
    long,
  },
  geometry: {
    type: "Polygon" as const,
    coordinates: [getPolygonFromCoord({ long, lat })],
  },
});

/**
 * Returns a 1x1 square centered around the given latitude and longitude.
 * The square is a closed ring, meaning the first and last points are the same.
 */
const getPolygonFromCoord = ({
  long,
  lat,
}: {
  long: number;
  lat: number;
}): [number, number][] => {
  const openRingPolygon = [
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.5, -0.5],
    [-0.5, -0.5],
  ].map(([dLong, dLat]): [number, number] => {
    const newLong = getBoundedValue({
      value: long + dLong,
      min: -180,
      max: 180,
    });
    const newLat = getBoundedValue({
      value: lat + dLat,
      min: -90,
      max: 90,
    });
    return [newLong, newLat];
  });

  return [...openRingPolygon, openRingPolygon[0]];
};
