export default class BuxtError extends Error {
    errorHeaders: { [key: string]: string };

    constructor(message: string) {
        super(message);
    }

    attachHeaders(response: Response): void {
        response.headers.append("Buxt-Rejection-Cause", this.name);
        response.headers.append("Buxt-Rejection-Reason", this.message);
    }
}