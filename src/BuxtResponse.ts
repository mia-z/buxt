export default class BuxtResponse {
    response: Response;
    options: ResponseInit = {};
    isUsed: boolean;

    headers(header: HeadersInit): BuxtResponse {
        this.options.headers = header;
        return this;
    }

    setStatusCode(code: number): BuxtResponse {
        this.options.status = code;
        return this;
    }

    setOptions(options: ResponseInit): BuxtResponse {
        this.options = options;
        return this;
    }

    setStatusText(text: string): BuxtResponse {
        this.options.statusText = text;
        return this;
    }

    setHeader(key: string, value: string): BuxtResponse {
        if (!key || !value) {
            throw new Error('Headers key or value should not be empty');
        }

        const headers = this.options.headers;
        if (!headers) {
            this.options.headers = { keys: value };
        }
        this.options.headers[key] = value;
        return this;
    }
    
    getHeaders(): HeadersInit {
        return this.options.headers;
    }

    getResponse(): Response {
        return this.response;
    }
    
    send(body?: any): void {
        this.response = new Response(body, this.options);
        this.isUsed = true;
    }

    json(body: any): void {
        this.response = Response.json(body, this.options);
        this.isUsed = true;
    }
}