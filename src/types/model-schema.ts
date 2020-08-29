import knex from "knex";
import {InductModel} from "../gen-model";
import {ValidationError} from "class-validator";

export type InductModelFactory<T> = (
    args: InductModelOpts<T>
) => Promise<InductModel<T>>;

export type InductModelFunction<T> = () => Promise<
    T | T[] | number | ValidationResult<T>
>;

export interface InductModelOpts<T> {
    values: T;
    /** Knex database connection object for the model to use */
    connection: knex;
    schema: new (values: T) => T;
    /** Set to true for bulk operations accross the whole table, skipping individual validation  */
    all?: boolean;
    /** Set to true to validate input data on instantiation */
    validate?: boolean;
    fields?: Array<string>;
}

export interface IModel<T> {
    trx: knex.Transaction;
    validated: boolean;
    options: InductModelOpts<T>;
    table_name: string;
    id_field: string;
    model: T;

    startTransaction: () => Promise<knex.Transaction>;
    destroyConnection: () => Promise<void>;
    commitTransaction: () => Promise<void>;
    rollbackTransaction: () => Promise<void>;
    findOneById: (value?: string | number) => Promise<T[]>;
    findAll: () => Promise<T[]>;
    create?: (value?: Partial<T>) => Promise<T>;
    delete?: (value?: number | string) => Promise<number | string>;
    update?: (value?: Partial<T>) => Promise<T | number>;
    exists?: <K extends keyof T>(
        column: keyof T,
        value: T[K]
    ) => Promise<boolean>;
    validate?: () => Promise<ValidationError[]>;
    set<K extends keyof T>(prop: K, value: T[K]): void;
    get<K extends keyof T>(prop: K): T[K];
}

export type BaseModelFunction =
    | "commitTransaction"
    | "create"
    | "delete"
    | "destroyConnection"
    | "startTransaction"
    | "rollbackTransaction"
    | "findOneById"
    | "findAll"
    | "update"
    | "validate";

export interface ValidationResult<T> {
    data: T | T[];
    errors: Error[];
}
