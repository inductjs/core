import { StringMap } from './utils';

export type ContextKeys<T> = keyof T;

export type RequestContext = {
    user: Record<string, any>;
};

export type ContextMap<T, C = {}> = {
    [key in ContextKeys<C>]: keyof T;
};

export type GBindingConfigEntry<T, C = {}> =
    | ContextKeys<C>
    | Array<ContextKeys<C> | Partial<ContextMap<T, C>>>;

export type StringBindingConfigEntry = string | Array<string | StringMap>;

export type BindingConfigEntry<T, C = {}> =
    | StringBindingConfigEntry
    | GBindingConfigEntry<T, C>;

export type BindingConfig<T> = {
    user?: Record<string, any>;
    params?: Record<string, any>;
    query?: Record<string, any>;
};

export type InductContext<U, P, Q> = {
    user?: Partial<U>;
    params?: Partial<P>;
    query?: Partial<Q>;
};
