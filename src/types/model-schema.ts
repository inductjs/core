import {ValidationError} from "class-validator";
import {InductModel, InductModelOpts} from "./induct";
import {getModelForClass} from "@typegoose/typegoose";

export enum FunctionType {
    Query = "query",
    Mutation = "mutation",
}

export type Constructor<T> = new (...any: any[]) => T;

export type ModelFactory<T> = (
    values: T,
    opts: InductModelOpts<T>,
    ...args: unknown[]
) => Promise<InductModel<T>>;

export type ModelFunction<T> = () => Promise<
    T | T[] | number | ValidationResult<T>
>;

export type ModelConstructor<T> = new (...any: any[]) => InductModel<T>;

/** Mark types that do not match the condition type (2nd parameter) as 'never' */
type SubType<Base, Condition> = Pick<
    Base,
    {
        [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
    }[keyof Base]
>;

export type FunctionOfInductModel<T> = keyof Omit<
    SubType<InductModel<T>, Function>,
    InternalFunctions
>;
export type FunctionOfModel<T> = keyof Omit<
    SubType<T, Function>,
    InternalFunctions
>;

export type InternalFunctions =
    | "commitTransaction"
    | "destroyConnection"
    | "startTransaction"
    | "rollbackTransaction"
    | "validate"
    | "con"
    | "trx"
    | "get"
    | "set";

export type TypegooseModel = ReturnType<typeof getModelForClass>;

export interface IInductSqlModel<T> {
    /** [TRANSACTIONS NOT IMPLEMENTED] Starts a knex transaction and stores this in the class instance */
    // startTransaction: () => Promise<knex.Transaction>;
    /** [TRANSACTIONS NOT IMPLEMENTED] Destroys the current knex transaction */
    // destroyConnection: () => Promise<void>;
    /** [TRANSACTIONS NOT IMPLEMENTED] Commits the current knex transaction */
    // commitTransaction: () => Promise<void>;
    /** [TRANSACTIONS NOT IMPLEMENTED] Performs a rollback of the current knex transaction */
    // rollbackTransaction: () => Promise<void>;
    /** Looks for a value based on the provided id_field in the model */
    findOneById?: (lookup?: T[keyof T]) => Promise<T[]>;
    /** Returns all the values in the provided table */
    findAll?: () => Promise<T[]>;
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
