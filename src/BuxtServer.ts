import { join } from "path";
import { cwd } from "process";
import ScanPaths from "./utils/ScanPaths";
import ValidateRoute from "./utils/ValidateRoutes";
import BuxtRequest from "./BuxtRequest";
import BuxtResponse from "./BuxtResponse";
import { Route, RoutePath } from "index";
import { RouteParameters } from "index.d";

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

    private constructor(port: number, routeRoot: string) {
        this.port = port;
        this.baseAddress = `http://localhost:${port}`;
        this.routeRoot = routeRoot;
    }
    
    /**
     * Factory-like function which creates an instance of the BuxtServer class
     * @date 11/5/2022 - 11:43:02 PM
     *
     * @static
     * @async
     * @param {number} port - port number to expose the server on
     * @returns {Promise<BuxtServer>} - Promise containing the created BuxtServer class
     */
    static async createServer(port: number, routeRoot: string = "routes"): Promise<BuxtServer> {
        const s = new BuxtServer(port, routeRoot);
        await s.registerRoutes();
        return s;
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
        const basePath = join(cwd(), this.routeRoot);
        this.routePaths = await ScanPaths(basePath, "");
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

    private async handleRequest(): Promise<void> {

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
            fetch: async (req) => {
                const bReq = await BuxtRequest.buildRequest(req);
                const bRes = new BuxtResponse();

                const route = this.matchRoute(bReq.matchPath);

                console.log(route);

                return new Response("Not Found", { status: 404 });
            }
        })
    }
}

