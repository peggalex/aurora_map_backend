"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuroraNoaaData = void 0;
const zod_1 = require("zod");
const schema = zod_1.z.object({
    "Observation Time": zod_1.z.string().transform((s) => new Date(Date.parse(s))),
    "Forecast Time": zod_1.z.string().transform((s) => new Date(Date.parse(s))),
    coordinates: zod_1.z.array(zod_1.z
        .array(zod_1.z.number())
        .length(3)
        .transform((x) => x)),
});
/**
 * Value object for NOAA public JSON data
 */
class AuroraNoaaData {
    constructor(props) {
        this.props = props;
        this.coordinates = props.coordinates.map((coord) => {
            // "Data Format": "[Longitude, Latitude, Aurora]"
            const [long360, lat, aurora] = coord;
            const long180 = long360 > 180 ? long360 - 180 : long360;
            return { long180, lat, aurora };
        });
    }
    get observationTime() {
        return this.props["Observation Time"];
    }
    get forecastTime() {
        return this.props["Forecast Time"];
    }
    static fromRaw(inputValue) {
        return new AuroraNoaaData(schema.parse(inputValue));
    }
}
exports.AuroraNoaaData = AuroraNoaaData;
