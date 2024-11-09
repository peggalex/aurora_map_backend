import { input, output, z } from "zod";

const schema = z.object({
	location: z.object({
		name: z.string().optional(),
		region: z.string().optional(),
		country: z.string().optional(),
		lat: z.number(),
		lon: z.number(),
	}),
	current: z.object({
		last_updated_epoch: z.number().transform((v) => new Date(v * 1000)),
		cloud: z.number().transform((v) => Math.round(v)),
		vis_km: z.number(),
	}),
});

/**
 * Value object for weather API data
 */
export class WeatherApiCurrentData {
	private constructor(private props: output<typeof schema>) {}

	get location(): {
		readonly [key in keyof output<typeof schema>["location"]]: output<
			typeof schema
		>["location"][key];
	} {
		return this.props["location"];
	}

	get forecastTime() {
		return this.props["current"]["last_updated_epoch"];
	}

	get cloudCoverage() {
		return this.props["current"]["cloud"];
	}

	get visibilityKm() {
		return this.props["current"]["vis_km"];
	}

	valueOf() {
		return { ...this.props };
	}

	static fromRaw(inputValue: input<typeof schema>) {
		return new WeatherApiCurrentData(schema.parse(inputValue));
	}
}
