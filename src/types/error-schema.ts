export class ValidationError extends Error {
    constructor(msg: string) {
        super(msg);
        this.message = msg;
        this.name = "InductValidationError";
    }
}
/* istanbul ignore next */
export class QueryError extends Error {
    constructor(msg: string) {
        super(msg);
        this.message = msg;
        this.name = "InductQueryError";
    }
}