export declare type ScanPaths = (path: string, currentLevel: string) => Promise<Array<RoutePath>>
export declare type ValidateRoute = (routepath: RoutePath) => Promise<Route> | never;

declare type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEAD" | "PATCH";

export declare class BuxtRequest {
    constructor(baseRequest: Request, paramData: Route | null);

    request: Request;
    method: string;
    path: string;
    matchPath: string;

    query: { [key: string]: string };
    headers: { [key: string]: string };
    params: { [key: string]: string };
    routeParameters: RouteParameters;

    body: any;
    blob: any;

    static buildRequest(req: Request): Promise<BuxtRequest>;
}

export declare class BuxtResponse {
    response: Response;
    options: ResponseInit;
    isUsed: boolean;

    headers(header: HeadersInit): BuxtResponse;

    setStatusCode(code: number): BuxtResponse;
    setOptions(options: ResponseInit): BuxtResponse;
    setStatusText(text: string): BuxtResponse;
    setHeader(key: string, value: string): BuxtResponse;
    
    getHeaders(): HeadersInit;
    getResponse(): Response;
    
    send(body: any): void;
    json(body: any): void;
}

export declare class BuxtServer {
    routes: string[];
    port: number;
    baseAddress: string;
    routeRoot: string;
    cors: boolean;
    corsConfig?: CorsConfig;

    private constructor(config: BuxtConfig)
    private constructor(port: number, routeRoot: string);

    static createServer(config: BuxtConfig): Promise<BuxtServer>;
    static createServer(port: number, routeRoot?: string): Promise<BuxtServer>;

    private registerRoutes(req: BuxtRequest, res: BuxtResponse, mappedRoute: Route): Promise<void>;
    private handleRequest(): Promise<Response> | Response;

    listen(): Promise<void>;
    stop(): void;
}

export declare type RoutePath = {
    FullPath: string,
    AbsolutePath: string
}

export declare type Route = {
    route: string,
    routeParameters: RouteParameters,
    delegate: (req: BuxtRequest, res: BuxtResponse) => Promise<BuxtResponse>;
}

export declare type RouteParameters = {
    [key: string]: string
}


export type BuxtConfig = {
    port: number,
    routeRoot: string,
    cors?: boolean,
    corsConfig?: CorsConfig
}

export type CorsConfig = {
    origins: string[],
    allowedMethods?: HttpMethod[]
}

export default function (port: number): Promise<BuxtServer>;