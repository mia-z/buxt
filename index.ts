import { BuxtServer } from "./dist/BuxtServer";
import type { BuxtRequest, BuxtResponse, Route, RoutePath } from "index.d";

const factoryFunction = BuxtServer.createServer;

export type { BuxtResponse, BuxtRequest, Route, RoutePath };

export { factoryFunction as CreateServer };
export default factoryFunction;