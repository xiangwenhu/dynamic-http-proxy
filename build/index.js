"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_proxy_middleware_1 = __importDefault(require("http-proxy-middleware"));
var util_1 = require("./util");
var PROXY_KEY = '__proxy__';
var DEFAULT_CONFIG = {
    changeOrigin: true,
    logLevel: "debug",
    secure: false,
    // hostRewrite: true,
    // autoRewrite: true,
    followRedirects: true // Default: false - specify whether you want to follow redirects
};
var proxyEventsProperties = ["onError", "onProxyRes", "onProxyReq", "onProxyReqWs", "onOpen", "onClose"];
var otherProperties = ["logProvider"];
var omitProperties = proxyEventsProperties.concat(otherProperties);
function mergeConfig(baseConfig, dynamicConfig) {
    var config = Object.create(null);
    // 删除不允许的配置
    omitProperties.forEach(function (p) {
        delete dynamicConfig[p];
    });
    return Object.assign(config, DEFAULT_CONFIG, baseConfig, dynamicConfig);
}
function accepts(req, type) {
    return !!req.accepts(type);
}
function responseError(req, res, error) {
    if (!res.finished) {
        var err = util_1.getError(error);
        if (accepts(req, ["application/json"])) {
            res.json(err);
        }
        else if (accepts(req, ["text", "html"])) {
            res.write(JSON.stringify(err));
            res.end();
        }
        else {
            // TODO::
            res.write(JSON.stringify(err));
            res.end();
        }
    }
}
function getProxyConfig(req, propertyKey) {
    var strConfig = req.headers[propertyKey];
    if (strConfig === undefined) {
        throw new Error("headers\u7F3A\u5C11\u53C2\u6570" + propertyKey);
    }
    var config = Array.isArray(strConfig) ? strConfig[0] : strConfig;
    if (config.startsWith("http:") || config.startsWith("https:") || config.startsWith("ws:")) {
        return {
            target: config
        };
    }
    return util_1.toJSON(config);
}
function createProxy(config, propertyKey) {
    if (config === void 0) { config = Object.create(null); }
    if (propertyKey === void 0) { propertyKey = PROXY_KEY; }
    return function (req, res, next) {
        try {
            var dynamicConfig = getProxyConfig(req, propertyKey);
            delete req.headers[propertyKey];
            var finalConfig = mergeConfig(config, dynamicConfig);
            http_proxy_middleware_1.default(finalConfig)(req, res, next);
        }
        catch (err) {
            responseError(req, res, err);
        }
        ;
    };
}
exports.default = createProxy;
;
