import { join } from "path";
import { cwd } from "process";
import ScanPaths from "./utils/ScanPaths";
import ValidateRoute from "./utils/ValidateRoutes";
import BuxtRequest from "./BuxtRequest";
import BuxtResponse from "./BuxtResponse";
import { Route, RoutePath } from "buxt";

export class BuxtServer {
    private routePaths: RoutePath[];

    routes: Route[];
    port: number;
    baseAddress: string;

    private constructor(port: number) {
        this.port = port;
        this.baseAddress = `http://localhost:${port}`;
    }

    static async createServer(port: number): Promise<BuxtServer> {
        const s = new BuxtServer(port);
        await s.registerRoutes();
        return s;
    }

    private async registerRoutes(): Promise<void> {
        const basePath = join(cwd(), "routes");
        this.routePaths = await ScanPaths(basePath, "");
        this.routes = await Promise.all(this.routePaths.map((rp, index) => {
            return ValidateRoute(rp);
        }));
    }

    async listen(): Promise<void> {
        console.info("Serving the following endpoints");
        this.routes.forEach(async (route, index) => {
            console.info(route.route);
        });

        Bun.serve({
            fetch: async (req) => {
                const bReq = await BuxtRequest.buildRequest(req);
                const bRes = new BuxtResponse();
                for (let route of this.routes) {
                    if (route.route === bReq.matchPath) {
                        await route.delegate(bReq, bRes);
                        return bRes.getResponse();
                    }
                }

                return new Response("Not Found", { status: 404 });
            }
        })
    }
}

