import { input, output, z } from "zod";

const schema = z.object({
	lat: z.string().transform((x) => Number(x)),
	long: z.string().transform((x) => Number(x)),
	timestamp: z
		.string()
		.datetime({ offset: true })
		.transform((s) => new Date(s)),
});

/**
 * Value object for get aurora chance for location request
 */
export class GetAuroraChanceForLocationRequest {
	private constructor(private props: output<typeof schema>) {}

	get lat() {
		return this.props.lat;
	}

	get long() {
		return this.props.long;
	}

	get timestamp() {
		return this.props.timestamp;
	}

	static fromRaw(inputValue: input<typeof schema>) {
		return new GetAuroraChanceForLocationRequest(schema.parse(inputValue));
	}
}
