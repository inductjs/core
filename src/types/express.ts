import { RequestContext } from './request-context';
import { Request as ExRequest } from 'express';
import Knex from 'knex';

export interface Request<T = {}> extends ExRequest {
    slug: string;
    con: Knex;
    result: any;
    model: any;
    binding: any;
    context: RequestContext<T>;
}

export {
	Response, NextFunction, Handler,
} from 'express';

