export class ValidationError extends Error {
    constructor(msg: string) {
        super(msg);
        this.message = msg;
        this.name = "InductValidationError";
    }
}

export class QueryError extends Error {
    constructor(msg: string) {
        super(msg);
        this.message = msg;
        this.name = "InductQueryError";
    }
}

export class UnsupportedModelMethodError extends Error {
    constructor(msg: string) {
        super(msg);
        this.message = msg;
        this.name = "UnsupportedModelMethod";
    }
}
