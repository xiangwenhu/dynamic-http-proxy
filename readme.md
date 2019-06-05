# dynamic-http-proxy  
动态代理http请求。  

## 示例

服务端: express：
```js
import express from "express"
const createProxy = require("dynamic-http-proxy").default

const app = express();
app.use("/proxy", createProxy({
    pathRewrite: {
        '^/proxy': ''
    }
}))

app.listen(6006, function () {
    console.log("listening at 6006");
})
```

前端: fetch调用：   

GET请求: 天气 
```js
fetch("/proxy/api/weather/city/101030100", {
      headers:{
         __proxy__: JSON.stringify({
               target: "http://t.weather.sojson.com",      
         })
      }
})
.then(res=> res.json())
.then(d=>console.log(d))
```

POST请求: 博客园子分类
```js
fetch("/proxy/aggsite/SubCategories",{
  "method": "post",
  "headers": {
    "content-type": "application/json; charset=UTF-8",
    "__proxy__": JSON.stringify({
      "target": "https://www.cnblogs.com"
    })
  },
  "body": JSON.stringify({
    "cateIds": "108698,2,108701,108703,108704,108705,108709,108712,108724,4"
  })
})
.then( res=> res.text())
.then(d=>console.log(d))
``` 


## 配置
`createProxy(config?: httpProxy.Config, propertyKey?: string)`   
`config`：    
参照 [http-proxy-middleware#http-proxy-options](https://github.com/chimurai/http-proxy-middleware#http-proxy-options)   
默认配置：
```json
{
  changeOrigin: true,
  logLevel: "debug",
  secure: false,
  followRedirects: true  
}
```

`propertyKey`:   
从headers中 读取代理配置的属性名



