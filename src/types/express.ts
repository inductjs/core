import { RequestContext } from './request-context';
import { HandlerConfig } from './handler-config';
import { Request as ExRequest } from 'express';
import { InductService } from './induct';
import Knex from 'knex';
import { Model } from '../sql-service';

export interface Request extends ExRequest {
    con: Knex;
    result: any;
	model: Model<any>;
    binding: any;
    context: RequestContext;
    config: HandlerConfig;
    db: InductService<unknown>;
}

export {
	Response, NextFunction, Handler,
} from 'express';

