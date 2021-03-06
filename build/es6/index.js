import httpProxy from "http-proxy-middleware";
import { toJSON, getError } from "./util";
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
        var err = getError(error);
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
        return Object.create(null);
    }
    var config = Array.isArray(strConfig) ? strConfig[0] : strConfig;
    if (config.startsWith("http:") || config.startsWith("https:") || config.startsWith("ws:")) {
        return {
            target: config
        };
    }
    return toJSON(config);
}
function checkProxyConfig(config) {
    if (!("target" in config)) {
        throw new Error("target参数不能为空！");
    }
}
export default function createProxy(config, propertyKey) {
    if (config === void 0) { config = Object.create(null); }
    if (propertyKey === void 0) { propertyKey = PROXY_KEY; }
    return function (req, res, next) {
        try {
            // 从headers获取代理配置
            var dynamicConfig = getProxyConfig(req, propertyKey);
            delete req.headers[propertyKey];
            // 合并
            var finalConfig = mergeConfig(config, dynamicConfig);
            // 检查必要参数
            checkProxyConfig(finalConfig);
            httpProxy(finalConfig)(req, res, next);
        }
        catch (err) {
            responseError(req, res, err);
        }
        ;
    };
}
;
