import httpProxy from "http-proxy-middleware";

declare function createProxy(config?: httpProxy.Config, propertyKey?: string): void;

declare module "createProxy" {
    export = createProxy;
}