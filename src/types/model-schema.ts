import knex from "knex";

export type InductModelFactory<T, M> = (
    factoryParams: Partial<T>,
    opts?: InductModelOpts
) => Promise<M>;

export type InductModelFunction<T> = () => Promise<
    T | T[] | number | ValidationResult<T>
>;

export interface InductModelOpts {
    /** Set to true for bulk operations accross the whole table, skipping individual validation  */
    all?: boolean;
    /** Set to true to validate input data on instantiation */
    validate?: boolean;
    connection?: knex;
}

export interface IModel<T> {
    trx: knex.Transaction;
    validated: boolean;
    options: InductModelOpts;
    table_name: string;
    id_field: string;
    model: T;

    startTransaction: () => Promise<knex.Transaction>;
    destroyConnection: () => Promise<void>;
    commitTransaction: () => Promise<void>;
    rollbackTransaction: () => Promise<void>;
    findOneById: (value?: string | number) => Promise<T[]>;
    findAll: () => Promise<T[]>;
    create?: (value?: Partial<T>) => Promise<T>;
    delete?: (value?: string | number) => Promise<number | string>;
    update?: (value?: Partial<T>) => Promise<T | number>;
    exists?: <K extends keyof T>(
        column: keyof T,
        value: T[K]
    ) => Promise<boolean>;
    validate?: (value?: T) => Promise<T>;
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
