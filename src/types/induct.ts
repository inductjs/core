import knex from "knex";
import {ModelConstructor, IInductSqlModel, Constructor, TypegooseModel} from "./model-schema";
import {Router} from "express";
import {ControllerResultOpts} from "../express/controller-result";
import {SqlModelBase} from "../sql-model-base";
import {MongoModelBase} from "../mongo-model-base";
import { mongoose } from "@typegoose/typegoose";

mongoose.connection


export type InductModel<T> = SqlModelBase<T> | MongoModelBase<T>;
export type InductModelOpts<T> = InductSQLOpts<T> | InductMongoOpts<T>;

export interface BaseOpts<T> {
    /** Field used as the id URL parameter to perform requests on */
    idField: keyof T;

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

export interface IInductBase<T> extends BaseOpts<T> {
    /** Creates a copy of InductBaseOpts stored in the instance. Takes options to locally override */
    getModel: (
        data: T,
        opts?: BaseOpts<T>,
        ...args: unknown[]
    ) => Promise<IInductSqlModel<T> | null>;
    router: () => Router;
    // query: () =>
}

export interface InductSQLOpts<T> extends BaseOpts<T> {
    schema: Constructor<T>;
    db: knex;
    tableName: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InductMongoOpts<T> extends BaseOpts<T> {
    db: mongoose.Connection;
    schema: Constructor<T>;
}

export type OverridableProps =
    | "schema"
    | "validate"
    | "fields"
    | "tableName"
    | "limit";

export type FullOpts<T> = BaseOpts<T> & InductSQLOpts<T>;

export type OverridableOpts<T> = Pick<FullOpts<T>, OverridableProps>;
