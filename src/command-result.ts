import { StatusCode } from './types/http';
import { ValidationError } from './errors';
import { Response } from 'express';

export interface ICommandResult<T> {
    /** HTTP Status code as integer */
    status: StatusCode;
    /** Data to be returned as the response body */
    data?: T;
    /** Optional extra information about the response */
    info?: string;
    /** Optional error message */
    error?: Error;
    blocked?: boolean;
    /** Array of occurred validation errors */
    validationErrors?: ValidationError[];
    /** Wrapper function around express' .json. Returns JSON response formed from data stored in ControllerResult instance */
    send?: (res: Response) => Response;
    /** Wrapper for express.response.redirect */
    redirect?: (res: Response, location: string) => void;
}

export interface CommandResultOpts {
    /** enables full error messages in response body */
    debug: boolean;
}

export class CommandResult<T> implements ICommandResult<T> {
    public readonly status: StatusCode;
    public readonly data: T;
    public readonly info: string;
    public readonly error: Error;
    public readonly validationErrors: ValidationError[];

    private opts: CommandResultOpts;

    constructor(result: ICommandResult<T>, opts?: CommandResultOpts) {
    	Object.assign(this, result);
    	this.opts = opts;
    }

    public send(res: Response): Response {
    	const response = {
    		...this.data,
    		info: this.info,
    		error: this.opts?.debug
    			? {
    				name: this.error?.name,
    				message: this.error?.message,
    				stack: this.error?.stack,
    			}
    			: this.error?.name,
    		validationErrors: this.validationErrors,
    	};

    	return res.status(this.status).send(response);
    }

    public redirect(res: Response, location: string): void {
    	return res.redirect(location);
    }
}
