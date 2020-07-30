import {StatusCode} from './types/http-schema';
import {ValidationError} from './types/error-schema';
import {Response} from 'express';

export interface IControllerResult<T> {
    status: StatusCode;
    res: Response;
    data?: T | T[];
    info?: string;
    error?: Error;
    blocked?: boolean;
    validationErrors?: ValidationError[];

    send?: () => Response;
    redirect?: (location: string) => void;
}

class ControllerResult<T> implements IControllerResult<T> {
    public readonly status: StatusCode;
    public readonly data: T | T[];
    public readonly info: string;
    public readonly error: Error;
    public readonly res: Response;
    public readonly validationErrors: ValidationError[];

    constructor(result: IControllerResult<T>) {
        this.status = result.status;
        this.data = result.data;
        this.info = result.info;
        this.error = result.error;
        this.res = result.res;
        this.validationErrors = result.validationErrors;
    }

    public send(): Response {
        return this.res.status(this.status).send({
            data: this.data,
            info: this.info,
            error: this.error,
            validationErrors: this.validationErrors,
        });
    }

    public redirect(location: string): void {
        return this.res.redirect(location);
    }
}

export {ControllerResult};
