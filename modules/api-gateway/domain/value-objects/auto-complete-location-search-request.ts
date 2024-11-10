import { input, output, z } from "zod";

const schema = z.object({
	search_term: z.string().min(1), // at least one character
});

/**
 * Value object for auto-complete location search request
 */
export class AutoCompleteLocationSearchRequest {
	private constructor(private props: output<typeof schema>) {}

	get searchTerm() {
		return this.props.search_term;
	}

	static fromRaw(inputValue: input<typeof schema>) {
		return new AutoCompleteLocationSearchRequest(schema.parse(inputValue));
	}
}
