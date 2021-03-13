import { ErrReturn } from './utils';

export type ModelAction<T> = (
    model?: T,
    newVal?: any
) => Promise<ErrReturn<T | T[]>> | ErrReturn<T | T[]>;
