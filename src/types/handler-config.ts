import Knex from 'knex';
import { ServiceFactory } from './induct';
export interface HandlerConfig {
    con: Knex;
    tables: string | string[];
    createService?: ServiceFactory;
}
