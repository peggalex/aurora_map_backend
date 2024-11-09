import { input, output, z } from "zod";

const schema = z.object({
	longitude: z.string().transform(Number),
	latitude: z.string().transform(Number),
});

/**
 * Value object for get current weather forecast request
 */
export class GetCurrentWeatherForecastRequest {
	private constructor(private props: output<typeof schema>) {}

	get longitude() {
		return this.props["longitude"];
	}

	get latitude() {
		return this.props["latitude"];
	}

	static fromRaw(inputValue: input<typeof schema>) {
		return new GetCurrentWeatherForecastRequest(schema.parse(inputValue));
	}
}
