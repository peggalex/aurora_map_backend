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
exports.GetAuroraForecastQuery = void 0;
class GetAuroraForecastQuery {
    constructor(repository) {
        this.repository = repository;
    }
    execute(_request) {
        return __awaiter(this, void 0, void 0, function* () {
            const auroraForecast = yield this.repository.getLatestAuroraForecast();
            if (!auroraForecast) {
                return null;
            }
            return {
                id: auroraForecast.id,
                forecastTime: auroraForecast.forecastTime.toISOString(),
                observationTime: auroraForecast.forecastTime.toISOString(),
                geoJson: auroraForecast.geoJson, // it's an interface so it isn't json serializable by default
            };
        });
    }
}
exports.GetAuroraForecastQuery = GetAuroraForecastQuery;
