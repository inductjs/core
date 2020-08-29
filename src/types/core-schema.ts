import knex from "knex";
import {InductControllerOpts} from "./controller-schema";

export interface InductBaseOpts<T> {
    connection: knex;
    schema: T;
    options: 
}
