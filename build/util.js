"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toJSON(str, defaultValue) {
    if (defaultValue === void 0) { defaultValue = Object.create(null); }
    if (typeof str === "object") {
        return str;
    }
    if (typeof str !== "string") {
        return defaultValue;
    }
    try {
        return JSON.parse(str);
    }
    catch (err) {
        return defaultValue;
    }
}
exports.toJSON = toJSON;
function getError(error) {
    var e = Object.create(null);
    e.message = error.message;
    e.stack = error.stack;
    e.name = error.name;
    return e;
}
exports.getError = getError;
