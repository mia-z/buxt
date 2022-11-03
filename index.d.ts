declare type ScanPaths = (path: string, currentLevel: string) => Promise<Array<RoutePath>>
declare type ValidateRoute = (routepath: RoutePath) => Promise<Route> | never;

declare type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEAD" | "PATCH";

declare class BuxtRequest {
    constructor(baseRequest: Request);

    request: Request;
    method: string;
    path: string;
    matchPath: string;

    query: { [key: string]: string };
    headers: { [key: string]: string };
    params: { [key: string]: string };

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

    private constructor(port: number);

    static createServer(): Promise<BuxtServer>;

    private registerRoutes(): Promise<void>;
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
    parameters: string[],
    delegate: (req: BuxtRequest, res: BuxtResponse) => Promise<BuxtResponse>;
}