/* istanbul ignore file */

import knex from "knex";
import {validate, ValidationError} from "class-validator";
import {InductOptions} from "../types/induct";
import {QueryError} from "../types/error-schema";
import { AdapterFunction } from "../types/model-schema";
import {Strategy} from "./abstract-strategy";
import Knex from "knex";

/* eslint-disable @typescript-eslint/no-explicit-any, no-invalid-this  */

/**
 * Induct Strategy for communicating with SQL databases. Uses KnexJS to execute database queries.
 */
export class SqlStrategy<T> extends Strategy<T> {
    protected _db: knex;
    protected _qb: knex.QueryBuilder;
    protected _tableName: string;
    protected _idField: keyof T;
    protected _trx: knex.Transaction;
    protected _options: InductOptions<T>;
    protected _trxProvider: any;
    protected _validated: boolean;
    protected _fields: Array<keyof T> | string;
    protected data: T;

    constructor(values: T, opts: InductOptions<T>) {
        super();

        if (values) this.data = new opts.schema(values); // eslint-disable-line new-cap
        this._db = opts.db as Knex;

        this._tableName = opts.tableName;
        this._idField = opts.idField as keyof T;
        this._fields = opts.fields ?? "*";

        this._qb = this._db(this._tableName);
    }

    public async exists<K extends keyof T>(
        column: K,
        value: T[K]
    ): Promise<boolean> {
        const exists = await this._qb.where({
            [column]: value,
        });

        return exists.length > 0;
    }

    public async findAll(): Promise<T[]> {
        try {
            const result = await this._qb.select(this._fields);

            return result;
        } catch (e) {
            throw new QueryError(`InductModel.findAll failed with error ${e}`);
        }
    }

    public async findOneById(lookup?: T[keyof T]): Promise<T[]> {
        try {
            const lookupValue = lookup ?? this.data[this._idField];

            const result = await this._qb
                .select(this._fields)
                .where(this._idField, lookupValue);

            return result ?? [];
        } catch (e) {
            throw new QueryError(
                `InductModel.findOneById failed with error ${e}`
            );
        }
    }

    public async create(value?: Partial<T>): Promise<T> {
        try {
            const insertedValue = value ?? this.data;

            await this._qb.insert(insertedValue);

            return this.data;
        } catch (e) {
            throw new QueryError(`InductModel.create failed with error ${e}`);
        }
    }

    public async update(value?: Partial<T>): Promise<number> {
        try {
            const updatedVal = value ?? this.data;
            const lookupVal = this.data[this._idField];

            const result = await this._qb
                .update(updatedVal)
                .where(this._idField, lookupVal);

            return result;
        } catch (e) {
            throw new QueryError(`InductModel.update failed with error ${e}`);
        }
    }

    public async delete(lookup?: T[keyof T]): Promise<T[keyof T]> {
        try {
            const lookupVal = lookup ?? this.data[this._idField];

            await this._qb.where(this._idField, lookupVal).del();

            return lookupVal;
        } catch (e) {
            throw new QueryError(`InductModel.delete failed with error ${e}`);
        }
    }

    public async validate(): Promise<ValidationError[]> {
        const result = await validate(this.data);
        this._validated = true;

        return result;
    }

    public adapterFunction<K extends keyof T>(
        lookupProps: K | K[], type: "find" | "delete" | "update", 
        fnName?: string): AdapterFunction<T> {
        return async (lookup?: T | T[K], newVal?: T): Promise<T[]> => {
            try {
                let lookupHash;
                let lookupVal;

                // Build lookup object
                if (Array.isArray(lookupProps)) {
                    lookupHash = lookupProps.map((p: keyof T) => ({
                        [p as keyof T]: (lookup as T)[p] ?? this.data[p] as T[K],
                    }))
                    .reduce((prev, next) => ({...prev, ...next}), {});
                } 
                else {
                    lookupVal = lookup ?? this.data[lookupProps];
                }

                let query: knex.QueryBuilder;

                if (type === "update") {
                    query = this._qb.update(newVal);
                } 
                else {
                    query = this._qb.select(this._fields);
                }

                // Lookup for multiple values or single value
                if (lookupHash) {
                    query.where(lookupHash);
                } 
                else {
                    query.where(lookupProps as string, lookupVal);
                }

                if (type === "delete") {
                    query.del();
                }

                const result = await query;

                return result;
            } catch (e) {
                throw new QueryError(
                    `InductModel.${fnName || "customMethod"} failed with error ${e}`
                );
            }
        };
    }
}

export default SqlStrategy;
