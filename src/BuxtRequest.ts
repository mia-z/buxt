export default class BuxtRequest {
    request: Request;
    method: string;
    path: string;
    matchPath: string;
    
    query: { [key: string]: string } = {};
    headers: { [key: string]: string } = {};
    params: { [key: string]: string } = {};

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

    static async buildRequest(req: Request): Promise<BuxtRequest> {
        const br = new BuxtRequest(req);
        const body = await req.json();
        req.arrayBuffer;
        br.body = body;
        br.blob = req.blob();
        return br;
    }
}