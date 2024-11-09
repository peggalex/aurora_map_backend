// src/index.ts
import { AuroraForecastDataModule } from "./modules/aurora-forecast-data/module";
import { ApiGatewayModule } from "./modules/api-gateway/module";
import { WeatherForecastModule } from "./modules/weather-forecast/module";
import * as dotenv from "dotenv";
import { LocationLookupModule } from "./modules/location-lookup/module";

dotenv.config();

const init = async () => {
	const auroraForecastDataModule = await AuroraForecastDataModule.init();
	const weatherForecastModule = WeatherForecastModule.init();
	const locationLookupModule = LocationLookupModule.init();

	const modules = {
		AuroraForecastData: auroraForecastDataModule,
		ApiGateway: await ApiGatewayModule.init(
			auroraForecastDataModule,
			weatherForecastModule,
			locationLookupModule
		),
		LocationLookupModule: locationLookupModule,
	};
};

init();
