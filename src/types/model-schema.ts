/* eslint-disable @typescript-eslint/no-explicit-any */
import {InductModel, InductModelOpts} from "./induct";

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

export type AdapterFunction<T> = (lookup?: T[keyof T] | T, newVal?: T) => Promise<any>;

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

export interface ValidationResult<T> {
    data: T | T[];
    errors: Error[];
}
