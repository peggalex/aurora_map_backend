import { IAuroraForecastRepository } from "../../domain/aurora-forecast-repository";
import { AuroraNoaaData } from "../../domain/value-objects/aurora-noaa-data";
import { GeoJsonService } from "../../domain/services/geojson-service";

export class DataPullProcessor {
	constructor(
		private auroraForecastRepository: IAuroraForecastRepository,
		private logger: {
			info: (msg: string) => void;
			error: (msg: string) => void;
		}
	) {}

	async process(attempt = 1): Promise<void> {
		this.logger.info(`Fetching data from NOAA... (attempt ${attempt})`);
		const result = await (async () => {
			try {
				return {
					status: "success" as const,
					response: await fetch(
						"https://services.swpc.noaa.gov/json/ovation_aurora_latest.json",
						{ signal: AbortSignal.timeout(10_000) }
					),
				};
			} catch {
				return { status: "failure" as const };
			}
		})();

		if (result.status === "failure") {
			if (attempt < 3) {
				return await this.process(attempt + 1);
			} else {
				//throw Error(`Failed after ${attempt} attempts`);
				this.logger.error(`Failed to fetch after ${attempt} attempts`);
				return;
			}
		}
		this.logger.info("\t...fetched");

		const data = await result.response.json();
		this.logger.info("Parsing data from NOAA...");
		const noaaData = AuroraNoaaData.fromRaw(data);
		const auroraForecast = new GeoJsonService().fromNoaaData(noaaData);
		this.logger.info("\t...parsed");
		this.auroraForecastRepository.saveAuroraForecast(auroraForecast);
	}
}
