import knex from "knex";
import {InductModel} from "../gen-model";
import {ValidationError} from "class-validator";

export type InductModelFactory<T> = (
    values: T | T[],
    args: InductModelOpts<T>
) => Promise<InductModel<T>>;

export type InductModelFunction<T> = () => Promise<
    T | T[] | number | ValidationResult<T>
>;

export type LookupModelFunction = "findAll" | "findOneById";
export type ModifierModelFunction = "create" | "delete" | "update";

export interface InductModelOpts<T> {
    /** Knex database connection object for the model to use */
    connection: knex;
    schema: new (values: T) => T;
    tableName: string;
    idField: keyof T;
    /** Set to true for bulk operations accross the whole table, skipping individual validation  */
    all?: boolean;
    /** Set to true to validate input data on instantiation */
    validate?: boolean;
    fields?: Array<keyof T>;
}

export interface IModel<T> {
    trx: knex.Transaction;
    validated: boolean;
    options: InductModelOpts<T>;
    table_name: string;
    id_field: keyof T;
    model: T;

    startTransaction: () => Promise<knex.Transaction>;
    destroyConnection: () => Promise<void>;
    commitTransaction: () => Promise<void>;
    rollbackTransaction: () => Promise<void>;
    findOneById: (lookup?: T[keyof T]) => Promise<T[]>;
    findAll: () => Promise<T[]>;
    create?: (value?: Partial<T>) => Promise<T>;
    delete?: (lookup?: T[keyof T]) => Promise<T[keyof T]>;
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
