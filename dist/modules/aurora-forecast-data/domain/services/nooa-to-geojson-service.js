"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoaaToGeoJsonService = void 0;
const aurora_geojson_1 = require("../value-objects/aurora-geojson");
const utilities_1 = require("../../../shared/utilities");
const aurora_forecast_1 = require("../aurora-forecast");
class NoaaToGeoJsonService {
    convert(noaaData) {
        return aurora_forecast_1.AuroraForecast.create({
            forecastTime: noaaData.forecastTime,
            observationTime: noaaData.observationTime,
            geoJson: aurora_geojson_1.AuroraGeoJson.fromRaw({
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
                    .map(({ long180, lat, aurora }, index) => ({
                    type: "Feature",
                    id: index.toString(),
                    properties: {
                        aurora,
                        lat,
                        long: long180,
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            getPolygonFromCoord({ long: long180, lat }),
                        ],
                    },
                })),
            }),
        });
    }
}
exports.NoaaToGeoJsonService = NoaaToGeoJsonService;
/**
 * Returns a 1x1 square centered around the given latitude and longitude.
 */
const getPolygonFromCoord = ({ long, lat }) => [
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.5, -0.5],
    [-0.5, -0.5],
].map(([dLong, dLat]) => {
    const newLong = (0, utilities_1.getBoundedValue)({
        value: long + dLong,
        min: -180,
        max: 179, // TODO: should be 180?
    });
    const newLat = (0, utilities_1.getBoundedValue)({
        value: lat + dLat,
        min: -90,
        max: 90, // TODO: should be 89?
    });
    return [newLong, newLat];
});
