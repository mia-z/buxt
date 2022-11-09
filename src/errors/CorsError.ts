import BuxtError from "../BuxtError";

export default class CorsError extends BuxtError {
    constructor(message: string) {
        super(message);
        this.name = "CorsError";
        this.message = message;
    }
}