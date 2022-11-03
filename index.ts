"use strict";

import { BuxtServer } from "./src/BuxtServer";
import { BuxtRequest, BuxtResponse } from "buxt";

const factoryFunction = BuxtServer.createServer;

export { factoryFunction as CreateServer };

export type { BuxtResponse, BuxtRequest };
export default BuxtServer.createServer;