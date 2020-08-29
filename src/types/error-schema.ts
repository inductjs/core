export class ValidationError extends Error {
    constructor(msg: string) {
        super();
        this.message = msg;
        this.name = "InductValidationError";
    }
}

export class QueryError extends Error {
    constructor(msg: string) {
        super();
        this.message = msg;
        this.name = "InductQueryError";
    }
}
