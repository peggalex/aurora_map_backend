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
exports.AuroraForecastMongoRepository = void 0;
const mongo_repository_1 = require("../../shared/mongo-repository");
const aurora_forecast_1 = require("../domain/aurora-forecast");
class AuroraForecastMongoRepository extends mongo_repository_1.MongoRepository {
    constructor() {
        super(...arguments);
        this.dbName = "auroraMap";
        this.collectionName = "auroraForecasts";
    }
    toDocument(auroraForecast) {
        return {
            id: auroraForecast.id,
            forecastTime: auroraForecast.forecastTime,
            observationTime: auroraForecast.observationTime,
            geoJson: auroraForecast.geoJson,
        };
    }
    fromDocument(document) {
        return new aurora_forecast_1.AuroraForecast(document.id, document.forecastTime, document.observationTime, document.geoJson);
    }
    saveAuroraForecast(auroraForecast) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateDocument(auroraForecast.id, auroraForecast);
        });
    }
    getLatestAuroraForecast() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getLatest();
        });
    }
}
exports.AuroraForecastMongoRepository = AuroraForecastMongoRepository;
