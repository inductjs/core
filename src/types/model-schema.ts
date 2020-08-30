import knex from "knex";
import {InductModel} from "../gen-model";
import {ValidationError} from "class-validator";

export type InductModelFactory<T> = (
    values: T | T[],
    args: InductModelOpts<T>
) => Promise<InductModel<T>>;

export type GenericModelFactory<T> = (
    ...args: any[]
) => Promise<unknown> | unknown;

export type InductModelFunction<T> = () => Promise<
    T | T[] | number | ValidationResult<T>
>;

/** String type that lists the possible functions contained in the model. Used to provide typing to the parameters of generation functions */
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

export type HandlerFunction =
    | "findAll"
    | "findOneById"
    | "create"
    | "delete"
    | "update";

export interface InductModelOpts<T> {
    /** Knex database connection object for the model to use */
    connection: knex;
    /** Class that defines the object schema for this model */
    schema: new (values: T) => T;
    /** Name of the table that this model should expose. Should include the table schema if applicable. */
    tableName: string;
    /** Field used as the id URL parameter to perform requests on */
    idField: keyof T;
    /** Set to true for bulk operations accross the whole table, skipping individual schema validation.  */
    all?: boolean;
    /** Set to true to validate input data on model instantiation */
    validate?: boolean;
    /** [NOT IMPLEMENTED] Array of field names that can be used as a lookup. For each entry in this array, a GET route is generated. */
    fields?: Array<keyof T>;
}

export interface IModel<T> {
    /** Access the current open transaction to query the database */
    trx: knex.Transaction;
    /** True if the validation function has run on this model instance */
    validated: boolean;
    /** The options provided to the model on instantiation */
    options: InductModelOpts<T>;
    /** Name of the table that this model should expose. Should include the table schema if applicable. */
    table_name: string;
    /** Field used as the id URL parameter to perform requests on */
    id_field: keyof T;
    /** The actual data stored in the model */
    model: T;

    /** [TRANSACTIONS NOT IMPLEMENTED] Starts a knex transaction and stores this in the class instance */
    startTransaction: () => Promise<knex.Transaction>;
    /** [TRANSACTIONS NOT IMPLEMENTED] Destroys the current knex transaction */
    destroyConnection: () => Promise<void>;
    /** [TRANSACTIONS NOT IMPLEMENTED] Commits the current knex transaction */
    commitTransaction: () => Promise<void>;
    /** [TRANSACTIONS NOT IMPLEMENTED] Performs a rollback of the current knex transaction */
    rollbackTransaction: () => Promise<void>;
    /** Looks for a value based on the provided id_field in the model */
    findOneById: (lookup?: T[keyof T]) => Promise<T[]>;
    /** Returns all the values in the provided table */
    findAll: () => Promise<T[]>;
    /** Inserts one value in the provided table */
    create?: (value?: Partial<T>) => Promise<T>;
    /** Deletes one value based on the provided id_field */
    delete?: (lookup?: T[keyof T]) => Promise<T[keyof T]>;
    /** Updates one or more values based on the provided id_field */
    update?: (value?: Partial<T>) => Promise<T | number>;
    /** Checks if a value exists for a column and value */
    exists?: <K extends keyof T>(
        column: keyof T,
        value: T[K]
    ) => Promise<boolean>;
    /** Runs class-validator on the provided model value */
    validate?: () => Promise<ValidationError[]>;
    /** Sets a value in the model data */
    set<K extends keyof T>(prop: K, value: T[K]): void;
    /** Gets a value from the model data */
    get<K extends keyof T>(prop: K): T[K];
}

export interface ValidationResult<T> {
    data: T | T[];
    errors: Error[];
}
