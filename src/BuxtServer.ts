import { join } from "path";
import { cwd } from "process";
import ScanPaths from "./utils/ScanPaths";
import ValidateRoute from "./utils/ValidateRoutes";
import BuxtRequest from "./BuxtRequest";
import BuxtResponse from "./BuxtResponse";
import CorsError from "./errors/CorsError";
import { BuxtConfig, CorsConfig, Route, RoutePath } from "index.d";

/**
 * Server class
 * Sets up the routes and validates them
 * @date 11/5/2022 - 11:39:41 PM
 *
 * @export
 * @class BuxtServer
 * @typedef {BuxtServer}
 */
export class BuxtServer {
    private routePaths: RoutePath[];

    routes: Route[];
    port: number;
    baseAddress: string;
    routeRoot: string;
    cors: boolean = false;
    corsConfig?: CorsConfig;

    private constructor(port: number, routeRoot: string);
    private constructor(config: BuxtConfig);
    private constructor(...args: any[]) {
        if (typeof args[0] === "number" && typeof args[1] === "string") {
            this.port = args[0];
            this.baseAddress = `http://localhost:${args[0]}`;
            this.routeRoot = args[1];
        } else if ("port" in args[0] && "routeRoot" in  args[0]) {
            this.port = args[0].port;
            this.baseAddress = `http://localhost:${args[0].port}`;
            this.routeRoot = args[0].routeRoot;
            this.cors = args[0].cors || false;
            this.corsConfig = args[0].corsConfig || null;
        }
        //TODO: This constructor is NOT exhaustive - will probably cause problems at some point
        if (this.port < 1024) {
            console.warn("Be careful when using a port under 1024 as some systems require special permissions to expose them");
        }
    }
    
    /**
     * Factory-like function which creates an instance of the BuxtServer class
     * @date 11/5/2022 - 11:43:02 PM
     *
     * @static
     * @async
     * @param {number} port - port number to expose the server on
     * @param {string} routeRoot - the directory which serves the routes
     * @param {BuxtConfig} config - config object
     * @returns {Promise<BuxtServer>} - Promise containing the created BuxtServer class
     */
    static async createServer(port: number, routeRoot?: string): Promise<BuxtServer>;
    static async createServer(config: BuxtConfig): Promise<BuxtServer>;
    static async createServer(...args: any[]): Promise<BuxtServer> {
        var s: BuxtServer;

        if (typeof args[0] === "number") {
            const rr = args[1] || "routes";
            s = new BuxtServer(args[0], rr);

        } else if ("port" in args[0] && "routeRoot" in args[0]) {
            BuxtServer.validateConfig(args[0]);
            s = new BuxtServer(args[0]);
        } else {
            throw new Error(`BuxtServer must be supplied with a valid port, port and route name or BuxtConfig object`);
        }

        await s.registerRoutes();
        return s;
    }

    
    /**
     * function for validating the BuxtConfig object, if supplied
     * @date 11/7/2022 - 11:08:25 PM
     *
     * @private
     * @param {BuxtConfig} config
     * @returns {boolean}
     */
    static validateConfig(config: BuxtConfig): void {
        const { routeRoot, cors, corsConfig } = config;
        if (cors && cors === true) {
            if (!corsConfig) {
                throw new Error(`Must supply a cors config object if cors is set to true`);
            }

            const { origins, allowedMethods } = corsConfig;
            if (!allowedMethods) {
                console.warn("No cors methods were specified, applying GET, OPTIONS and POST as default");
                corsConfig.allowedMethods = [ "GET", "OPTIONS", "POST" ]
            }

            if (origins.length > 1) {
                origins.forEach((origin, index) => {
                    if (origin.includes("*")) {
                        throw new Error("Using multiple wildcards is discouraged, use a single wildcard origin, eg: '*'");
                    }
                });
            }
        }

        if (!routeRoot.match(/^(src\/routes|routes)$/)) {
            console.warn("You're not using the default route path (<project-root>/routes or <project-root>/src/routes)");
        }
    }

    /**
     * Calls a subroutine which scans for routes and relevant files under the chosen route directory
     * @date 11/5/2022 - 11:44:44 PM
     *
     * @private
     * @async
     * @returns {Promise<void>} 
     */
    private async registerRoutes(): Promise<void> {
        this.routePaths = await ScanPaths(this.routeRoot, "");
        this.routes = await Promise.all(this.routePaths.map((rp, index) => {
            return ValidateRoute(rp);
        }));
    }
    
    /**
     * Routine used to match the route of incoming requests to the routes that were regestered when the Server class was created
     * @date 11/5/2022 - 11:45:33 PM
     *
     * @private
     * @param {string} routeToMatch - the incoming request url route
     * @returns {(Route | null)} - the data of the mapped route or null if nothing was matched
     * @remarks this function is mostly a dirty solution that I came up with quickly, I have no doubt it can be vastly improved, but at this time and state of the project, it will more than suffice.
     */
    private matchRoute(routeToMatch: string): Route | null {
        let currentDepth = 0;
        const routeToMatchSections = routeToMatch.split("/");
        for (let route of this.routes) {
            const mappedRoute = route.route.split("/");
            for (let section of mappedRoute) {
                if (section === routeToMatchSections[currentDepth]) {
                    if (mappedRoute.length > currentDepth + 1 && 
                        routeToMatchSections.length > currentDepth + 1) {
                        currentDepth++;
                        continue;
                    } else if (mappedRoute.length > routeToMatchSections.length ||
                        mappedRoute.length < routeToMatchSections.length) {
                        break;
                    } else {
                        return route;
                    }
                }
                if (currentDepth > 0) {
                    if (section.match(/(?<=\[)(.*?)(?=\])/g)) {
                        if (mappedRoute.length > currentDepth + 1 && 
                            routeToMatchSections.length > currentDepth + 1) {
                            route.routeParameters[section.replaceAll(/([\[\]])*/g, "")] = routeToMatchSections[currentDepth];
                            currentDepth++;
                            continue;
                        } else if (mappedRoute.length > routeToMatchSections.length ||
                            mappedRoute.length < routeToMatchSections.length) {
                            break;
                        } else {
                            route.routeParameters[section.replaceAll(/([\[\]])*/g, "")] = routeToMatchSections[currentDepth];
                            return route;
                        }
                    }
                }
            }
            currentDepth = 0;
        }
        return null;
    }

    private async handleRequest(req: BuxtRequest, res: BuxtResponse, mappedRoute: Route): Promise<Response> {

        await mappedRoute.delegate(req, res);

        if (!res.isUsed) {
            throw new Error(`A response wasnt sent back or invoked`, { cause: `res.send or res.json were not called - these must be called to send a response` });
        }
        
        return res.getResponse();
    }
    
    /**
     * Method for handling cors requests
     * @date 11/8/2022 - 2:25:51 PM
     *
     * @private
     * @async
     * @param {Request} req - Request object from underlying request
     * @returns {string} - the validated origin to be used in the responding cors header.
     */
    private validateCors(req: Request): string {
        const originHeader = req.headers.get("Origin");
        if (!originHeader || originHeader === "") {
            throw new CorsError("Invalid 'Origin' Header");
        }

        if (!this.corsConfig.origins.includes(originHeader) && this.corsConfig.origins[0] !== "*") {
            throw new CorsError("This origin is not allowed");
        }

        const originResponseValue = this.corsConfig.origins.find((s) => {
            if (s === originHeader) {
                return s;
            }
        });

        if ((!originResponseValue || originResponseValue === "") && (this.corsConfig.origins[0] !== "*")) {
            throw new Error(`The origin response header couldnt be made, although it was found in the previous includes clause - if this error ever throws then something is wrong somewhere. Tell Ryan.`);
        }

        return originHeader;
    }

    
    /**
     * Helper method that appends appropriate cors errors - if cors has been enabled
     * @date 11/9/2022 - 8:43:20 PM
     *
     * @private
     * @param {BuxtResponse} response - the prepared response object that the headers will be appended to
     * @param {string} origin - the validated origin of the cors request
     */
    private appendCorsHeaders(response: BuxtResponse, origin: string): void {
        response.setHeader("Access-Control-Allow-Origin", origin || "*");
        response.setHeader("Access-Control-Allow-Methods", this.corsConfig.allowedMethods.join(","));
        response.setHeader("Connection", "keep-alive");
        response.setHeader("Vary", "Access-Control-Request-Headers");
        response.setHeader("User-Agent", "Buxt - REST API server for Bun");
    }

    
    /**
     * Helper method for handling requests that are send with an OPTIONS request
     * Used in situations where cors is applicable
     * @date 11/9/2022 - 8:44:26 PM
     *
     * @private
     * @param {Request} req - the underlying request to evaluate for cors
     * @returns {BuxtResponse} - the response to repond to the cors request with
     */
    private handleCorsOptionsRequest(req: Request): BuxtResponse {
        const origin = this.validateCors(req);
        const res = new BuxtResponse();
        this.appendCorsHeaders(res, origin);
        return res;
    }

    
    /**
     * Helper method for handling requests that include headers for a cors-related request
     * Used in situations where cors is applicable
     * @date 11/9/2022 - 8:45:23 PM
     *
     * @private
     * @param {Request} req - the underlying request
     * @param {BuxtResponse} res - the prepared response object that will have cors headers appended
     */
    private handleCorsHeaderRequest(req: Request, res: BuxtResponse): void {
        const origin = this.validateCors(req);
        this.appendCorsHeaders(res, origin);
    }

    /**
     * Starts listening for incoming requests
     * @date 11/5/2022 - 11:47:13 PM
     *
     * @async
     * @returns {Promise<void>}
     */
    async listen(): Promise<void> {
        console.info("Serving the following endpoints");
        this.routes.forEach(async (route, index) => {
            console.info(route.route);
        });

        Bun.serve({
            port: this.port,
            fetch: async (req) => {
                try {
                    const bRes = new BuxtResponse();

                    if (this.cors) {
                        if (req.method === "OPTIONS") {
                            return this.handleCorsOptionsRequest(req)
                                .getResponse();
                        }

                        if (req.headers.get("Sec-Fetch-Mode") === "cors") {
                            this.handleCorsHeaderRequest(req, bRes);
                        }
                    }
    
                    const bReq = await BuxtRequest.buildRequest(req);
    
                    const route = this.matchRoute(bReq.matchPath);
    
                    if (route) {
                        bReq.routeParameters = route.routeParameters;
                        return await this.handleRequest(bReq, bRes, route);
                    } else {
                        return new Response("Not Found", { status: 404, statusText: "NOT FOUND" });
                    }
                } catch (error) {
                    if (error instanceof CorsError) {
                        const res = new Response("Cors Error", {
                            status: 403,
                            statusText: "Forbidden"
                        });
                        error.attachHeaders(res);
                        return res;
                    }

                    return new Response(error, {
                        status: 500,
                        statusText: "Internal Server Error"
                    });
                }
            }
        })
    }
}

