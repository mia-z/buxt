import { BuxtServer } from "./dist/BuxtServer";
import type { BuxtRequest, BuxtResponse, Route, RoutePath } from "index.d";

const factoryFunction = BuxtServer.createServer;

export { factoryFunction as CreateServer };

export type { BuxtResponse, BuxtRequest, Route, RoutePath };
export default BuxtServer.createServer;