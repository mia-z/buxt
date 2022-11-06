/**
 * Class containing data and functions for handling the response
 * @date 11/5/2022 - 11:53:50 PM
 *
 * @export
 * @class BuxtResponse
 * @typedef {BuxtResponse}
 */
export default class BuxtResponse {
    response: Response;
    options: ResponseInit = {};
    isUsed: boolean;

    
    /**
     * The underlying headers of the request
     * @date 11/5/2022 - 11:54:35 PM
     *
     * @param {HeadersInit} header - the headers to apply to the underlying response
     * @returns {BuxtResponse} - Web native HeadersInit object
     */
    headers(header: HeadersInit): BuxtResponse {
        this.options.headers = header;
        return this;
    }

    
    /**
     * Sets the status code of the underlying response
     * @date 11/5/2022 - 11:55:19 PM
     *
     * @param {number} code - the desired status code of the response
     * @returns {BuxtResponse} - 'this' object to allow function chaining
     */
    setStatusCode(code: number): BuxtResponse {
        this.options.status = code;
        return this;
    }

    
    /**
     * Sets the options of the underlying response
     * @date 11/5/2022 - 11:55:49 PM
     *
     * @param {ResponseInit} options - the desired options value of the response
     * @returns {BuxtResponse} - 'this' object to allow function chaining
     */
    setOptions(options: ResponseInit): BuxtResponse {
        this.options = options;
        return this;
    }

    
    /**
     * Sets the status text of the underlying response
     * @date 11/5/2022 - 11:56:36 PM
     *
     * @param {string} text - the text to display of the status text of the response
     * @returns {BuxtResponse} - 'this' object to allow function chaining
     */
    setStatusText(text: string): BuxtResponse {
        this.options.statusText = text;
        return this;
    }

    
    /**
     * Sets a single header of the underlying response, or replaces it if it exists
     * @date 11/5/2022 - 11:57:19 PM
     *
     * @param {string} key - the key of the header to set/replace
     * @param {string} value - the value of the header to set/replace
     * @returns {BuxtResponse} - 'this' object to allow function chaining
     */
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
    
     /**
      * Gets the headers of the underlying response
      * @date 11/5/2022 - 11:58:04 PM
      *
      * @returns {HeadersInit} - {HeadersInit} object of the underlying response
      */
    getHeaders(): HeadersInit {
        return this.options.headers;
    }

    
    /**
     * Gets the underlying response object
     * @date 11/5/2022 - 11:58:32 PM
     *
     * @returns {Response} Web native Response object
     * @remarks - probably don't use this directly as it's used when communicating the response back to the Bun fetch handler
     */
    getResponse(): Response {
        return this.response;
    }
    
    
    /**
     * Dispatch response back to the requester
     * @date 11/6/2022 - 12:00:07 AM
     *
     * @param {?*} [body] - the desired body object to send back to the requester
     */
    send(body?: any): void {
        this.response = new Response(body, this.options);
        this.isUsed = true;
    }

    
    /**
     * Dispatch response as JSON back to the requester
     * @date 11/6/2022 - 12:01:02 AM
     *
     * @param {*} body - the desired body to serialize to JSON before sending back to the requester
     */
    json(body: any): void {
        this.response = Response.json(body, this.options);
        this.isUsed = true;
    }
}