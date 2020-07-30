export class ValidationError extends Error {
    constructor(msg: string) {
        super();
        this.message = msg;
        this.name = "FactionsValidationError";
    }
}

export class QueryError extends Error {
    constructor(msg: string) {
        super();
        this.message = msg;
        this.name = "FactionsQueryError";
    }
}
