import { RequestContext } from './request-context';
import { Request as ExRequest } from 'express';
import Knex from 'knex';

export interface Request extends ExRequest {
    con: Knex;
    result: any;
    model: any;
    binding: any;
    context: RequestContext;
}

export {
	Response, NextFunction, Handler,
} from 'express';
