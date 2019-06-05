import httpProxy from "http-proxy-middleware";
import express from "express"
import { toJSON, getError } from "./util"

const PROXY_KEY = '__proxy__';
const DEFAULT_CONFIG = {
  changeOrigin: true,
  logLevel: "debug",
  secure: false,
  // hostRewrite: true,
  // autoRewrite: true,
  followRedirects: true  // Default: false - specify whether you want to follow redirects
}

const proxyEventsProperties = ["onError", "onProxyRes", "onProxyReq", "onProxyReqWs", "onOpen", "onClose"];
const otherProperties = ["logProvider"];
const omitProperties = proxyEventsProperties.concat(otherProperties);

function mergeConfig(baseConfig: httpProxy.Config, dynamicConfig: httpProxy.Config): httpProxy.Config {
  const config = Object.create(null);
  // 删除不允许的配置
  omitProperties.forEach(function (p) {
    delete (dynamicConfig as any)[p];
  });
  return Object.assign(config, DEFAULT_CONFIG, baseConfig, dynamicConfig);
}

function accepts(req: express.Request, type: string[]) {
  return !!req.accepts(type)
}

function responseError(req: express.Request, res: express.Response, error: Error) {
  const err = getError(error)
  if (accepts(req, ["application/json"])) {
    res.json(err);
  } else if (accepts(req, ["text", "html"])) {
    res.write(JSON.stringify(err))
    res.end();
  }
}

export default function createProxy(config: httpProxy.Config = Object.create(null) as httpProxy.Config, propertyKey: string = PROXY_KEY) {
  return function (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const dynamicConfig = toJSON(req.headers[propertyKey]);
      delete req.headers[propertyKey]
      const finalConfig = mergeConfig(config, dynamicConfig);
      httpProxy(finalConfig)(req, res, next);
    } catch (err) {
      responseError(req, res, err);
    };
  };
};
