/* eslint-disable @typescript-eslint/no-explicit-any */
import { Strategy } from '../strategies/abstract-strategy';
import { InductStrategyOpts } from './induct';
import { SubType } from './utils';

export enum FunctionType {
    Query = 'query',
    Mutation = 'mutation',
}

export type ModelFactory<T> = (
    values: T,
    opts: InductStrategyOpts<T>,
    ...args: unknown[]
) => Promise<Strategy<T>>;

export type ModelConstructor<T> = new (...any: any[]) => Strategy<T>;
export type AdapterFunction<T> = (lookup?: T[keyof T] | T, newVal?: T) => Promise<any>;

export type FunctionOfInductModel<T> = keyof Omit<
    SubType<Strategy<T>, Function>,
    InternalFunctions
>;
export type FunctionOfModel<T> = keyof Omit<
    SubType<T, Function>,
    InternalFunctions
>;

export type InternalFunctions =
    | 'commitTransaction'
    | 'destroyConnection'
    | 'startTransaction'
    | 'rollbackTransaction'
    | 'validate'
    | 'con'
    | 'trx'
    | 'get'
    | 'set';

export interface ValidationResult<T> {
    data: T | T[];
    errors: Error[];
}
