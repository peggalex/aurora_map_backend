import { WeatherApiCurrentData } from "../weather-api-current-data";

describe("WeatherApiCurrentData", () => {
	it("should parse a weather API current.json response", () => {
		const repsonseJson = {
			location: {
				name: "London",
				region: "City of London, Greater London",
				country: "United Kingdom",
				lat: 51.517,
				lon: -0.106,
				tz_id: "Europe/London",
				localtime_epoch: 1730171211,
				localtime: "2024-10-29 03:06",
			},
			current: {
				last_updated_epoch: 1730170800,
				last_updated: "2024-10-29 03:00",
				temp_c: 12.2,
				temp_f: 54.0,
				is_day: 0,
				condition: {
					text: "Fog",
					icon: "//cdn.weatherapi.com/weather/64x64/night/248.png",
					code: 1135,
				},
				wind_mph: 6.0,
				wind_kph: 9.7,
				wind_degree: 232,
				wind_dir: "SW",
				pressure_mb: 1022.0,
				pressure_in: 30.18,
				precip_mm: 0.0,
				precip_in: 0.0,
				humidity: 94,
				cloud: 50,
				feelslike_c: 11.3,
				feelslike_f: 52.3,
				windchill_c: 11.5,
				windchill_f: 52.7,
				heatindex_c: 12.4,
				heatindex_f: 54.3,
				dewpoint_c: 11.0,
				dewpoint_f: 51.8,
				vis_km: 0.4,
				vis_miles: 0.0,
				uv: 0.0,
				gust_mph: 10.3,
				gust_kph: 16.5,
			},
		};
		let weatherApiCurrentData: WeatherApiCurrentData;
		expect(() => {
			weatherApiCurrentData = WeatherApiCurrentData.fromRaw(repsonseJson);
		}).not.toThrow();
		expect(weatherApiCurrentData!.valueOf()).toMatchObject({
			location: {
				name: "London",
				region: "City of London, Greater London",
				country: "United Kingdom",
				lat: 51.517,
				lon: -0.106,
			},
			current: {
				last_updated_epoch: new Date(1730170800 * 1000),
				cloud: 50,
				vis_km: 0.4,
			},
		});
	});
});
