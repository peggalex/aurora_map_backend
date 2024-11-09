export type ReadWeatherForecast = {
	location: {
		name: string | null;
		region: string | null;
		country: string | null;
		latitude: number;
		longitude: number;
	};
	forecastTime: string;
	cloudCoverage: number;
	visibilityKm: number;
};
