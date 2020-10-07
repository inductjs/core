import knex from "knex";
import {ModelConstructor, Constructor} from "./model-schema";
import mongoose from "mongoose";
import {ControllerResultOpts} from "../express/controller-result";
import {SqlAdapter} from "../adapters/sql-adapter";
import {MongoAdapter} from "../adapters/mongo-adapter";

export type InductModel<T> = SqlAdapter<T> | MongoAdapter<T>;
export type InductModelOpts<T> = InductSQLOpts<T> | InductMongoOpts<T>;
export type SchemaConstructor<T> = new (val: T) => T;

export interface BaseOpts<T> {
    schema: Constructor<T>;
    /** Constructor function for the model used to perform database queries */
    customModel?: ModelConstructor<T>;
    /** Set to true to validate input data on model instantiation */
    validate?: boolean;
    /** Array of field names that should be retrieved by queries */
    fields?: Array<keyof T>;
    /** Custom name for the name of the ID param in code */
    idParam?: string;
    /** Maximum amount of records returned */
    limit?: number;

    resultOpts?: ControllerResultOpts;
}

export interface InductSQLOpts<T> extends BaseOpts<T> {
    /** Field used as the id URL parameter to perform requests on */
    idField: keyof T;
    schema: SchemaConstructor<T>;
    db: knex;
    tableName: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InductMongoOpts<T> extends BaseOpts<T> {
    db: mongoose.Connection;
    schema: Constructor<T>;
    idField?: keyof (T & {_id?: string});
}

export type OverridableProps =
    | "schema"
    | "validate"
    | "fields"
    | "tableName"
    | "limit";

export type FullOpts<T> = BaseOpts<T> & InductSQLOpts<T>;

export type OverridableOpts<T> = Pick<FullOpts<T>, OverridableProps>;
