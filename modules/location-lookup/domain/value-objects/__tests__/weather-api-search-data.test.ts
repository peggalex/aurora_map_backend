import { WeatherApiSearchData } from "../weather-api-search-data";

describe("WeatherApiSearchData", () => {
	it("should parse a weather API current.json response", () => {
		const repsonseJson = [
			{
				id: 2801268,
				name: "London",
				region: "City of London, Greater London",
				country: "United Kingdom",
				lat: 51.52,
				lon: -0.11,
				url: "london-city-of-london-greater-london-united-kingdom",
			},
			{
				id: 315398,
				name: "London",
				region: "Ontario",
				country: "Canada",
				lat: 42.98,
				lon: -81.25,
				url: "london-ontario-canada",
			},
			{
				id: 2610925,
				name: "Londonderry",
				region: "New Hampshire",
				country: "United States of America",
				lat: 42.87,
				lon: -71.37,
				url: "londonderry-new-hampshire-united-states-of-america",
			},
		];
		let weatherApiCurrentData: WeatherApiSearchData;
		expect(() => {
			weatherApiCurrentData = WeatherApiSearchData.fromRaw(repsonseJson);
		}).not.toThrow();
		expect(
			weatherApiCurrentData!.datums.map((datum) => datum.valueOf())
		).toMatchObject([
			{
				name: "London",
				region: "City of London, Greater London",
				country: "United Kingdom",
				lat: 51.52,
				lon: -0.11,
			},
			{
				name: "London",
				region: "Ontario",
				country: "Canada",
				lat: 42.98,
				lon: -81.25,
			},
			{
				name: "Londonderry",
				region: "New Hampshire",
				country: "United States of America",
				lat: 42.87,
				lon: -71.37,
			},
		]);
	});
});
