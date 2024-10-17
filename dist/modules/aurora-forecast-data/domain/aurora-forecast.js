"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuroraForecast = void 0;
const crypto_1 = require("crypto");
/**
 * Aurora Forecast aggregate
 */
class AuroraForecast {
    constructor(id, forecastTime, observationTime, geoJson) {
        this.id = id;
        this.forecastTime = forecastTime;
        this.observationTime = observationTime;
        this.geoJson = geoJson;
    }
    static create({ forecastTime, observationTime, geoJson, }) {
        return new AuroraForecast((0, crypto_1.randomUUID)(), forecastTime, observationTime, geoJson);
    }
}
exports.AuroraForecast = AuroraForecast;
