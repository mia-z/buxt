<p align="center">
<!-- <img src="https://github.com/mia-z/buxt/actions/workflows/main.js.yml/badge.svg" /> -->
<img src=https://img.shields.io/github/package-json/v/mia-z/buxt />
<img src=https://img.shields.io/github/commit-activity/w/mia-z/buxt />
<img src="https://img.shields.io/codecov/c/github/mia-z/buxt" />

---

<p align="center">
<img src="./.gitfiles/buxt-logo.png">
 
<h3 align="center"><b>Lightweight filesystem-based router for creating REST APIs.</b>

---

## <p align="center"> **Note**

<p align="center"> This project is currently very early development, and I wouldn't recommend it for production. Feel free to use it as you like and if you find any problems then submit an issue via github issues tab.

---

## <p align="center"> Features/Roadmap

- [x] Nested routing
- [x] Route parameters
- [ ] Catch-all routes on same level as named routes
- [x] Implement response handling logic fully
- [ ] Middleware
- [x] CORS solution
- [ ] Advanced Logging
- [ ] Authentication
- [ ] Websockets
- [ ] ESLint plugin
---

## <b>Installation</b>
`bun a buxt`

## <b>Getting started</b>
Starting a basic server with the default values

``` typescript
//index.ts
import CreateServer from "buxt";

await CreateServer(3000).then(s => s.listen());

//routes/example_endpoint.ts
import type { BuxtRequest, BuxtResponse } from "buxt"; //typings arent required, but useful!

export default async function(req: BuxtRequest, res: BuxtResponse) {
    res.send("Hello!");
}
```
Thats it!

---

## <b>Usage</b>

By default, the app will search for exported functions under <b>\<project-root>/routes</b> and <b>\<project-root>/src/routes</b>, unless specified when creating the server.

Aside from the previous example, there are three other ways of creating and starting a buxt server:


### <b><u>Create a server with default route root using port 3000</u></b>
``` typescript
//index.ts
import CreateServer from "buxt";

const server = await CreateServer(3000);
await server.listen();
```

### <u><b>Create a server with default route root using port 3000 and a custom root route path</b></u>

``` typescript
//index.ts
import CreateServer from "buxt";

const server = await CreateServer(3000, "src/api");
await server.listen();
```

### <u><b>Create a server with config object</u></b>

``` typescript
//index.ts
import CreateServer from "buxt";

const server = await CreateServer({
    port: 3000,
    routeRoot: "api",
    cors: true,
    corsConfig: {
        origins: [ "*" ]
    }
});
await server.listen();
```

### Definitions for config

``` typescript
type BuxtConfig = {
    port: number,
    routeRoot: string,
    cors?: boolean = false,
    corsConfig?: CorsConfig = null
}

type CorsConfig = {
    origins: string[],
    allowedMethods?: HttpMethod[] = ["GET", "OPTIONS", "POST"]
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEAD" | "PATCH";

```

### <u><b>Route parameters</b></u>
Route parameters work they they do in Next.js - they're denoted by a variable name surrounded by square brackets, eg: routes/user/[user].ts

They can then be accessed on the BuxtRequest object under `req.routeParameters.{variable_name}`
``` typescript
//routes/user/[user].ts
import type { BuxtRequest, BuxtResponse } from "buxt";

export default async function(req: BuxtRequest, res: BuxtResponse) {
    res.send("Hello " + req.routeParameters.user);
}
```

### <u><b>Enabling Cors</b></u>
You must create a server using a config object to enable cors responses.

``` typescript
//index.ts
import CreateServer from "buxt";

const server = await CreateServer({
    port: 3000,
    routeRoot: "api",
    cors: true,
    corsConfig: {
        origins: [ "localhost:3000", "localhost:3001", "https://miaz.xyz/", "http://miaz.xyz" ],
        allowedMethods: [ "GET", "POST", "OPTIONS", "PUT", "DELETE"]
    }
});
```

Firstly, make sure the cors key is set to `true`, then pass in a `CorsConfig` object. The `CorsConfig`'s `origins` key cannot be null. If you're allowing all origins then simply make it a single item array with `["*"]`.

<b>Reminder</b> that you cannot combine wildcard routes and non-wildcard routes; if you attempt to do this then it  will throw an error.

---
###### Big thanks to <a href="https://github.com/lau1944">lau1994</a> and their project <a href="https://github.com/lau1944/bunrest">Bunrest</a> (really nice express-like server built for Bun) which has helped me a lot getting this project started.