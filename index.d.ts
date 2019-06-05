import httpProxy from "http-proxy-middleware";
import express from "express"

declare function createProxy(config?: httpProxy.Config, propertyKey?: string): express.NextFunction;

export = createProxy
