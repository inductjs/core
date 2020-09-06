import {HttpStatusCode} from "azure-functions-ts-essentials";
import {ValidationError} from "./types/error-schema";
import {Response} from "express";

export interface IControllerResult<T> {
    /** HTTP Status code as integer */
    status: HttpStatusCode;
    /** Express response object */
    res: Response;
    /** Data to be returned as the response body */
    data?: T | T[] | T[keyof T] | number;
    /** Optional extra information about the response */
    info?: string;
    /** Optional error message */
    error?: Error;
    blocked?: boolean;
    /** Array of occurred validation errors */
    validationErrors?: ValidationError[];
    /** Wrapper function around express' .json. Returns JSON response formed from data stored in ControllerResult instance */
    send?: () => Response;
    /** Wrapper for express.response.redirect */
    redirect?: (location: string) => void;
}

export interface ControllerResultOpts {
    /** enables full error messages in response body */
    debug: boolean;
}

export class ControllerResult<T> implements IControllerResult<T> {
    public readonly status: HttpStatusCode;
    public readonly data: T | T[] | T[keyof T] | number;
    public readonly info: string;
    public readonly error: Error;
    public readonly res: Response;
    public readonly validationErrors: ValidationError[];

    private opts: ControllerResultOpts;

    constructor(result: IControllerResult<T>, opts?: ControllerResultOpts) {
        Object.assign(this, result);
        this.opts = opts;
    }

    public send(): Response {
        return this.res.status(this.status).json({
            data: this.data,
            info: this.info,
            error: this.opts.debug ? this.error.message : this.error?.name,
            validationErrors: this.validationErrors,
        });
    }

    public redirect(location: string): void {
        return this.res.redirect(location);
    }
}

export default ControllerResult;
