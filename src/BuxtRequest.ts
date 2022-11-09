import { RouteParameters } from "index.d";
import { Route } from "index";

/**
 * Request class representing request data
 * @date 11/6/2022 - 12:01:45 AM
 *
 * @export
 * @class BuxtRequest
 * @typedef {BuxtRequest}
 */
export default class BuxtRequest {
    request: Request;
    method: string;
    path: string;
    matchPath: string;
    
    query: { [key: string]: string } = {};
    headers: { [key: string]: string } = {};
    params: { [key: string]: string } = {};
    routeParameters: RouteParameters = {};

    body: any;
    blob: any;

    constructor(req: Request) {
        this.request = req;
        const { searchParams, pathname } = new URL(req.url);
        this.path = pathname;
        this.matchPath = pathname.slice(1, pathname.length);
        this.method = req.method;
        
        searchParams.forEach((value, key) => {
            this.query[key] = value;
        });

        req.headers.forEach((value, key) => {
            this.headers[key] = value;
        });
    }
    
    /**
     * Function that builds the request object which can be used when building a response
     * @date 11/6/2022 - 12:02:18 AM
     *
     * @static
     * @async
     * @param {Request} req
     * @returns {Promise<BuxtRequest>} - Promise containing the transformed request object to be used later on
     */
    static async buildRequest(baseRequest: Request, paramData: RouteParameters | null = null): Promise<BuxtRequest> {
        const br = new BuxtRequest(baseRequest);
        const body = await baseRequest.json();
        br.routeParameters = paramData;
        baseRequest.arrayBuffer;
        br.body = body;
        br.blob = baseRequest.blob();
        return br;
    }
}