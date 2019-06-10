import express from "express"
const fs = require("fs");
const path = require("path");
// import createProxy from "dynamic-http-proxy"
// import createProxy from  "../src/index"
//import createProxy from "../build/es6"
const createProxy = require("../build/index").default;
const https = require("https");

const privateKey = fs.readFileSync(
    path.resolve(__dirname, "./cert/key.pem"),
    "utf8"
);
const certificate = fs.readFileSync(
    path.resolve(__dirname, "./cert/cert.pem"),
    "utf8"
);

const app = express();

app.use(express.static(__dirname + "/public"))


app.use("/proxy", createProxy({
    target: "http://t.weather.sojson.com",
    ssl: { key: privateKey, cert: certificate },
    pathRewrite: {
        '^/proxy': ''
    },
    onError: function (err: Error) {
        console.log(err)
    }
}))

/*
const httpsServer = https.createServer(
    { key: privateKey, cert: certificate },
    app
); */

app.listen(6006, function () {
    console.log("listening at 6006");
})