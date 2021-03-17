import { StringMap } from './utils';

export type ContextKeys<T> = keyof T

export type RequestContext = {
    user: object;
}

export type ContextMap<T, C = {}> = {
    [key in ContextKeys<C>]: keyof T;
}

export type GBindingConfigEntry<T, C = {}> =
    ContextKeys<C> | Array<ContextKeys<C> | Partial<ContextMap<T, C>>>;

export type StringBindingConfigEntry =
    string | Array<string | StringMap>;

export type BindingConfigEntry<T, C = {}> =
    StringBindingConfigEntry | GBindingConfigEntry<T, C>

export type BindingConfig<T, C = {}> = {
    user?: GBindingConfigEntry<T, C>;
    params?: StringBindingConfigEntry;
    query?: StringBindingConfigEntry;
}
