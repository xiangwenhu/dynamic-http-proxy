export function toJSON(str: any, defaultValue: any = Object.create(null)) {
    if (typeof str === "object") {
        return str;
    }
    if (typeof str !== "string") {
        return defaultValue;
    }

    try {
        return JSON.parse(str);
    } catch (err) {
        return defaultValue;
    }
}


export function getError(error: Error) {
    const e = Object.create(null);
    e.message = error.message;
    e.stack = error.stack;
    e.name = error.name;
    return e;
}