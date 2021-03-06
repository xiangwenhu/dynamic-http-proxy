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
  if (!res.writableEnded) {
    const err = getError(error)
    if (accepts(req, ["application/json"])) {
      res.json(err);
    } else if (accepts(req, ["text", "html"])) {
      res.write(JSON.stringify(err))
      res.end();
    } else {
      // TODO::
      res.write(JSON.stringify(err))
      res.end();
    }
  }
}

function getProxyConfig(req: express.Request, propertyKey: string) {
  const strConfig = req.headers[propertyKey];
  if (strConfig === undefined) {
    return Object.create(null);
  }

  let config: string = Array.isArray(strConfig) ? strConfig[0] : strConfig;
  if (config.startsWith("http:") || config.startsWith("https:") || config.startsWith("ws:")) {
    return {
      target: config
    }
  }
  return toJSON(config);
}


function checkProxyConfig(config: httpProxy.Config) {
  if (!("target" in config)) {
    throw new Error("target参数不能为空！");
  }
}



export default function createProxy(config: httpProxy.Config = Object.create(null) as httpProxy.Config, propertyKey: string = PROXY_KEY) {
  return function (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      // 从headers获取代理配置
      const dynamicConfig = getProxyConfig(req, propertyKey);
      delete req.headers[propertyKey]
      // 合并
      const finalConfig = mergeConfig(config, dynamicConfig);
      // 检查必要参数
      checkProxyConfig(finalConfig);
      httpProxy(finalConfig)(req, res, next);
    } catch (err) {
      responseError(req, res, err);
    };
  };
};
