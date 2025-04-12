export class BaseError extends Error {
    public statusCode: number;
    constructor(message: string, statusCode: number = 500) {
        super(message)
        this.statusCode = statusCode
    }
}