import { input, output, z } from "zod";

const schema = z.object({
	"Observation Time": z.string().transform((s) => new Date(Date.parse(s))),
	"Forecast Time": z.string().transform((s) => new Date(Date.parse(s))),
	coordinates: z.array(
		z
			.array(z.number())
			.length(3)
			.transform((x) => x as [number, number, number])
	),
});

/**
 * Value object for NOAA public JSON data
 */
export class AuroraNoaaData {
	declare coordinates: { long180: number; lat: number; aurora: number }[];

	private constructor(private props: output<typeof schema>) {
		this.coordinates = props.coordinates.map((coord) => {
			// "Data Format": "[Longitude, Latitude, Aurora]"
			const [long360, lat, aurora] = coord;
			const long180 = long360 > 180 ? long360 - 180 : long360;
			return { long180, lat, aurora };
		});
	}

	get observationTime() {
		return this.props["Observation Time"];
	}

	get forecastTime() {
		return this.props["Forecast Time"];
	}

	static fromRaw(inputValue: input<typeof schema>) {
		return new AuroraNoaaData(schema.parse(inputValue));
	}
}
