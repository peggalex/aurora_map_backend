import { AuroraForecast } from "../aurora-forecast";

export class AuroraChanceForLocationService {
	/**
	 * Searches through an AuroraForecast GeoJson to find the aurora chance for given coords.
	 *
	 * Because we filter out coords with a chance of 0, this isn't a straight forward index
	 * lookup due to missing coords.
	 *
	 * However, the data we get from NOAA is guarenteed to be sorted by longitude (360)
	 * then latitude.
	 *
	 * We can use a binary search algorithm on longitutde then latitude.
	 * Note, longitude is sorted by 360 longitude, so 179 < -180 etc.
	 */
	getChance({
		lat: targetLat,
		long: targetLong180,
		forecastGeoJson,
	}: {
		lat: number;
		long: number;
		forecastGeoJson: AuroraForecast["geoJson"];
	}) {
		targetLat = Math.round(targetLat);

		const toLong360 = (long180: number) =>
			long180 < 0 ? long180 + 360 : long180;
		const targetLong360 = toLong360(Math.round(targetLong180));

		const doesFeatureMatch = ({ index }: { index: number }) => {
			const { properties } = forecastGeoJson.features[index];
			return (
				properties.lat === targetLat &&
				toLong360(properties.long) === targetLong360
			);
		};

		const getAurora = ({ index }: { index: number }) =>
			forecastGeoJson.features[index].properties.aurora;

		let startBound = 0;
		if (doesFeatureMatch({ index: startBound })) {
			return getAurora({ index: startBound });
		}

		let endBound = forecastGeoJson.features.length - 1;
		if (doesFeatureMatch({ index: endBound })) {
			return getAurora({ index: endBound });
		}

		/**
		 * At any given iteration, start and end bound are guarenteed to have been
		 * checked already, because they were either initially checked above, or were
		 * re-assigned from a midpoint that we always check each iteration.
		 */
		while (endBound - startBound > 1) {
			const midPoint =
				startBound + Math.round((endBound - startBound) / 2);

			const feature = forecastGeoJson.features[midPoint];
			// search by longitude
			if (toLong360(feature.properties.long) === targetLong360) {
				// then search by latitude
				if (feature.properties.lat === targetLat) {
					return getAurora({ index: midPoint });
				}
				if (feature.properties.lat < targetLat) {
					startBound = midPoint;
				} else {
					endBound = midPoint;
				}
			} else if (toLong360(feature.properties.long) < targetLong360) {
				startBound = midPoint;
			} else {
				endBound = midPoint;
			}
		}
		return null;
	}
}
