"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoundedValue = void 0;
const getBoundedValue = ({ value, min, max, }) => {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
};
exports.getBoundedValue = getBoundedValue;
