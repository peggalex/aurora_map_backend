import { input, output, z } from "zod";

const schema = z.object({
	name: z.string().optional(),
	region: z.string().optional(),
	country: z.string().optional(),
	lat: z.number(),
	lon: z.number(),
});

/**
 * Value object for weather API search data element
 */
export class WeatherApiSearchDatum {
	private constructor(private props: output<typeof schema>) {}
	static schema = schema;

	get name() {
		return this.props["name"];
	}

	get region() {
		return this.props["region"];
	}

	get country() {
		return this.props["country"];
	}

	get lat() {
		return this.props["lat"];
	}

	get long() {
		return this.props["lon"];
	}

	valueOf() {
		return { ...this.props };
	}

	static fromRaw(inputValue: input<typeof schema>) {
		return new WeatherApiSearchDatum(schema.parse(inputValue));
	}
}
