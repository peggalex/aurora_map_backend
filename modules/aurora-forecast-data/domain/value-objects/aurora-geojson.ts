import {
	Feature,
	FeatureCollection as GeoJsonFeatureCollection,
	Polygon,
} from "geojson";
import { input, output, z } from "zod";

interface IAuroraGeoFeature extends Feature {
	type: "Feature";
	id: string;
	properties: {
		aurora: number;
		lat: number;
		long: number;
	};
	geometry: Polygon;
}

/**
 * Extends GeoJson standard type (feature collection)
 */
interface IAuroraGeoJson extends GeoJsonFeatureCollection {
	type: "FeatureCollection";
	features: IAuroraGeoFeature[];
}

const schema = z.object({
	type: z.literal("FeatureCollection"),
	features: z.array(
		z.object({
			type: z.literal("Feature"),
			id: z.string(),
			properties: z.object({
				aurora: z.number(),
				lat: z.number(),
				long: z.number(),
			}),
			geometry: z.object({
				type: z.literal("Polygon"),
				// coordinates: [[[y1,x1], [y2,x2],...]]
				coordinates: z
					.array(
						z.array(
							z.tuple([
								z.number().min(-180).max(180),
								// range: [-180, 180]; different from NOAA data which is [0, 360]
								z.number().min(-90).max(90),
							])
						)
					)
					.length(1),
			}),
		})
	),
});

/**
 * Aurora data stored in GeoJson standard format
 * Coordinates with an aurora value of 0 are omitted to save space
 */
export class AuroraGeoJson implements IAuroraGeoJson {
	readonly type = "FeatureCollection";
	declare readonly features: IAuroraGeoFeature[];

	private constructor(props: output<typeof schema>) {
		this.features = props.features;
	}

	static fromRaw(inputValue: input<typeof schema>) {
		return new AuroraGeoJson(schema.parse(inputValue));
	}
}
