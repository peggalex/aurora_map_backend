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
exports.AuroraForecastDataModule = void 0;
const cron_1 = require("cron");
const pull_data_processor_1 = require("./jobs/pull-data-processor");
const cron_time_generator_1 = require("cron-time-generator");
const aurora_forecast_mongo_repo_1 = require("../infrastructure/aurora-forecast-mongo-repo");
const get_aurora_forecast_1 = require("./queries/get-aurora-forecast");
class AuroraForecastDataModule {
    constructor(dataPullJob, getAuroraForecastQuery) {
        this.dataPullJob = dataPullJob;
        this.getAuroraForecastQuery = getAuroraForecastQuery;
    }
    /**
     * Initialize module instance
     */
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (AuroraForecastDataModule.singleton.type !== "NOT_INITIALIZED") {
                throw Error(`Already started initializing AuroraForecastDataModule`);
            }
            AuroraForecastDataModule.singleton = {
                type: "INITIALIZING",
            };
            const instance = yield AuroraForecastDataModule.createInstance();
            AuroraForecastDataModule.singleton = {
                type: "INITIALIZED",
                instance,
            };
            return instance;
        });
    }
    static createInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            const logger = {
                info: (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`),
            };
            const auroraForecastRepository = new aurora_forecast_mongo_repo_1.AuroraForecastMongoRepository();
            const dataPullProcess = new pull_data_processor_1.DataPullProcesser(auroraForecastRepository, logger);
            const dataPullJob = new cron_1.CronJob(cron_time_generator_1.CronTime.every(5).minutes(), () => __awaiter(this, void 0, void 0, function* () { return dataPullProcess.process(); }), // onTick
            () => console.log("Completed data pull"), // onComplete
            true // start
            );
            return new AuroraForecastDataModule(dataPullJob, new get_aurora_forecast_1.GetAuroraForecastQuery(auroraForecastRepository));
        });
    }
    getDataPullJob() {
        return this.dataPullJob;
    }
    getLatestAuroraForecast() {
        return this.getAuroraForecastQuery.execute({});
    }
}
exports.AuroraForecastDataModule = AuroraForecastDataModule;
AuroraForecastDataModule.singleton = {
    type: "NOT_INITIALIZED",
};
