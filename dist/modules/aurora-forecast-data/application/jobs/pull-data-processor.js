"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataPullProcesser = void 0;
const aurora_noaa_data_1 = require("../../domain/value-objects/aurora-noaa-data");
const nooa_to_geojson_service_1 = require("../../domain/services/nooa-to-geojson-service");
class DataPullProcesser {
    constructor(auroraForecastRepository, logger) {
        this.auroraForecastRepository = auroraForecastRepository;
        this.logger = logger;
    }
    process() {
        return __awaiter(this, arguments, void 0, function* (attempt = 1) {
            this.logger.info("Fetching data from NOAA...");
            const result = yield (() => __awaiter(this, void 0, void 0, function* () {
                try {
                    return {
                        status: "success",
                        response: yield fetch("https://services.swpc.noaa.gov/json/ovation_aurora_latest.json", { signal: AbortSignal.timeout(10000) }),
                    };
                }
                catch (_a) {
                    return { status: "failure" };
                }
            }))();
            this.logger.info("\t...fetched");
            if (result.status === "failure") {
                if (attempt < 3) {
                    return yield this.process(attempt + 1);
                }
                else {
                    throw Error(`Failed after ${attempt} attempts`);
                }
            }
            const data = yield result.response.json();
            this.logger.info("Parsing data from NOAA...");
            const noaaData = aurora_noaa_data_1.AuroraNoaaData.fromRaw(data);
            const auroraForecast = new nooa_to_geojson_service_1.NoaaToGeoJsonService().convert(noaaData);
            this.logger.info("\t...parsed");
            this.auroraForecastRepository.saveAuroraForecast(auroraForecast);
        });
    }
}
exports.DataPullProcesser = DataPullProcesser;
