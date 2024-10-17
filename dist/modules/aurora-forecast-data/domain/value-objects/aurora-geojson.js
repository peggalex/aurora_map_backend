"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuroraGeoJson = void 0;
const zod_1 = require("zod");
const schema = zod_1.z.object({
    type: zod_1.z.literal("FeatureCollection"),
    features: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.literal("Feature"),
        id: zod_1.z.string(),
        properties: zod_1.z.object({
            aurora: zod_1.z.number(),
            lat: zod_1.z.number(),
            long: zod_1.z.number(),
        }),
        geometry: zod_1.z.object({
            type: zod_1.z.literal("Polygon"),
            // coordinates: [[[y1,x1], [y2,x2],...]]
            coordinates: zod_1.z
                .array(zod_1.z.array(zod_1.z.tuple([
                zod_1.z.number().min(-180).max(180),
                // range: [-180, 180]; different from NOAA data which is [0, 360]
                zod_1.z.number().min(-90).max(90),
            ])))
                .length(1),
        }),
    })),
});
/**
 * Aurora data stored in GeoJson standard format
 * Coordinates with an aurora value of 0 are omitted to save space
 */
class AuroraGeoJson {
    constructor(props) {
        this.type = "FeatureCollection";
        this.features = props.features;
    }
    static fromRaw(inputValue) {
        return new AuroraGeoJson(schema.parse(inputValue));
    }
}
exports.AuroraGeoJson = AuroraGeoJson;
