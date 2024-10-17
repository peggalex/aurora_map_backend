import { AuroraGeoJson } from "../value-objects/aurora-geojson";
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

/**
 * Returns a 1x1 square centered around the given latitude and longitude.
 */
const getPolygonFromCoord = ({ long, lat }: { long: number; lat: number }) =>
	[
		[-0.5, 0.5],
		[0.5, 0.5],
		[0.5, -0.5],
		[-0.5, -0.5],
	].map(([dLong, dLat]): [number, number] => {
		const newLong = getBoundedValue({
			value: long + dLong,
			min: -180,
			max: 179, // TODO: should be 180?
		});
		const newLat = getBoundedValue({
			value: lat + dLat,
			min: -90,
			max: 90, // TODO: should be 89?
		});
		return [newLong, newLat];
	});
