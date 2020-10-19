/* eslint-disable @typescript-eslint/no-explicit-any */
import { IStrategy } from "../interfaces/IInductStrategy";
import { InductStrategyOpts } from "../types";
import { SubType } from "./utilities";

export enum FunctionType {
    Query = "query",
    Mutation = "mutation",
}

export type ModelFactory<T> = (
    values: T,
    opts: InductStrategyOpts<T>,
    ...args: unknown[]
) => Promise<IStrategy<T>>;

export type ModelConstructor<T> = new (...any: any[]) => IStrategy<T>;


export type FunctionOfInductModel<T> = keyof Omit<
    SubType<IStrategy<T>, Function>,
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
