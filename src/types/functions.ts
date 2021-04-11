import { PErrorEither } from './utils';
import knex from 'knex';

export type ModelAction<T> = (
    con: knex,
    data?: Partial<T>
) => PErrorEither<T | T[]>;
export type ModelActionFactory<T> = (
    table: string,
    lookupFields?: string[],
    returnFields?: string[]
) => ModelAction<T>;
