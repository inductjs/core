import knex from 'knex';
import mongoose from 'mongoose';
import { CommandResultOpts } from '../helpers/command-result';
import { InductController } from '../induct-controller';
import { PErrorEither } from './utils';
import { ModelAction } from './functions';

export type ControllerMap<T> = Map<string, InductController<T>>

export type InductStrategyOpts<T> = InductOptions<T> // SqlStrategyOpts<T> | MongoStrategyOpts<T>;
export type SchemaConstructor<T> = new (val: T, ...args: any[]) => T; // eslint-disable-line @typescript-eslint/no-explicit-any
export type OverridableOpts<T> = Pick<InductOptions<T>, OverridableProps>;
export type OverridableProps =
    | 'schema'
    | 'validate'
    | 'fields'
    | 'tableName'
    | 'limit';

export interface InductOptions<T> {
    /** Schema class */
    schema: SchemaConstructor<T>;
    /** Field to use for doing lookups */
    idField: keyof T | keyof (T & {_id?: string});
    /** Name of the table to expose, should be filled when using SQL strategy */
    tableName?: string;
    /** Knex or mongoose connection object */
    db?: knex | mongoose.Connection;
    /** Set to true to validate input data on model instantiation */
    validate?: boolean;
    /** Array of field names that should be retrieved by queries */
    fields?: Array<keyof T>;
    /** Custom name for the name of the ID param in code */
    idParam?: string;
    /** Maximum amount of records returned */
    limit?: number;
    /** Options to transform the HTTP response object */
    resultOpts?: CommandResultOpts;
}

export type ServiceFactory = <T>(con: knex, table: string) => InductService<T>
export interface InductService<T> {
    create: (model: Model<T>) => PErrorEither<T>;
    find: (model: Model<T>) => PErrorEither<T[]>;
    findAll: () => PErrorEither<T[]>;
    update: (model: Model<T>) => PErrorEither<T>;
    del: (model: Model<T>) => PErrorEither<T>;
    [k: string]: ModelAction<T>;
}
