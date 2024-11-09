import { AuroraNoaaData } from "../aurora-noaa-data";
import ovationAuroraLatest from "./ovation_aurora_latest.json";

describe("AuroraNoaaData", () => {
	it("should parse a NOAA GeoJson response", () => {
		let auroraNoaaData: AuroraNoaaData;
		expect(() => {
			auroraNoaaData = AuroraNoaaData.fromRaw(ovationAuroraLatest);
		}).not.toThrow();
		expect(auroraNoaaData!.forecastTime.valueOf()).toEqual(
			new Date("2024-10-12T20:25:00Z").valueOf()
		);
		expect(auroraNoaaData!.observationTime.valueOf()).toEqual(
			new Date("2024-10-12T19:37:00Z").valueOf()
		);
		// [0, -90, 4]
		expect(auroraNoaaData!.coordinates[0]).toEqual({
			lat: -90,
			long180: 0,
			aurora: 4,
		});
	});
	it("should convert longitude 360 into longitude 180", () => {
		const auroraNoaaData = AuroraNoaaData.fromRaw({
			"Observation Time": "2000-01-01",
			"Forecast Time": "2000-01-02",
			coordinates: [[190, 50, 12]],
		});
		expect(auroraNoaaData.coordinates[0]).toEqual({
			lat: 50,
			long180: -170,
			aurora: 12,
		});
	});
});
