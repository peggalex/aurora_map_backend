import { input, output, z } from "zod";
import { WeatherApiSearchDatum } from "./weather-api-search-datum";

const schema = z.array(WeatherApiSearchDatum.schema);

/**
 * Value object for weather API search data
 */
export class WeatherApiSearchData {
	private _datums: WeatherApiSearchDatum[];
	private constructor(private props: output<typeof schema>) {
		this._datums = props.map((datum) =>
			WeatherApiSearchDatum.fromRaw(datum)
		);
	}
	public schema = typeof schema;

	get datums() {
		return [...this._datums];
	}

	static fromRaw(inputValue: input<typeof schema>) {
		return new WeatherApiSearchData(schema.parse(inputValue));
	}
}
