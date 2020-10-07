/* eslint-disable @typescript-eslint/no-explicit-any  */
/* eslint-disable no-invalid-this */
import knex from "knex";
import {validate, ValidationError} from "class-validator";
import {BaseOpts, InductSQLOpts} from "../types/induct";
import {QueryError} from "../types/error-schema";
import InductAdapter from "./abstract-adapter";

/**
 * Base class for CRUD operation APIs. Takes a generic type parameter based on
 */
export class SqlAdapter<T> extends InductAdapter<T> {
    protected _con: knex;
    protected _qb: knex.QueryBuilder;
    protected _tableName: string;
    protected _idField: keyof T;
    protected _trx: knex.Transaction;
    protected _data: T;
    protected _options: BaseOpts<T>;
    protected _trxProvider: any;
    protected _validated: boolean;
    protected _fields: Array<keyof T> | string;

    constructor(values: T, opts: InductSQLOpts<T>) {
        super();

        if (values) this._data = new opts.schema(values); // eslint-disable-line new-cap

        this._tableName = opts.tableName;
        this._con = opts.db;
        this._idField = opts.idField;
        this._fields = opts.fields ?? "*";
        this._qb = this._con(this._tableName);
    }

    // public async destroyConnection(): Promise<void> {
    //     await this._trx.destroy();
    // }

    // public async startTransaction(): Promise<knex.Transaction> {
    //     if (this._trx) await this._trx.destroy();

    //     this._trx = await this._con.transaction();

    //     return this._trx;
    // }

    // public async commitTransaction(): Promise<void> {
    //     this._trx.commit();
    // }

    // public async rollbackTransaction(): Promise<void> {
    //     this._trx.rollback();
    // }

    /* istanbul ignore next */
    public get<K extends keyof T>(prop: K): T[K] {
        return this._data[prop];
    }

    /* istanbul ignore next */
    public set<K extends keyof T>(prop: K, value: T[K]): void {
        this._data[prop] = value;
    }

    /* istanbul ignore next */
    public async exists<K extends keyof T>(
        column: K,
        value: T[K]
    ): Promise<boolean> {
        const exists = await this._qb.where({
            [column]: value,
        });

        return exists.length > 0;
    }

    /* istanbul ignore next */
    public async findAll(): Promise<T[]> {
        try {
            const result = await this._qb.select(this._fields);

            return result;
        } catch (e) {
            throw new QueryError(`InductModel.findAll failed with error ${e}`);
        }
    }

    /* istanbul ignore next */
    public async findOneById(lookup?: T[keyof T]): Promise<T[]> {
        try {
            const lookupValue = lookup ?? this._data[this._idField];

            const result = await this._qb
                .select(this._fields)
                .where(this._idField, lookupValue);

            return result;
        } catch (e) {
            throw new QueryError(
                `InductModel.findOneById failed with error ${e}`
            );
        }
    }

    /* istanbul ignore next */
    public async create(value?: Partial<T>): Promise<T> {
        try {
            const insertedValue = value ?? this._data;

            await this._qb.insert(insertedValue);

            return this._data;
        } catch (e) {
            throw new QueryError(`InductModel.create failed with error ${e}`);
        }
    }

    /* istanbul ignore next */
    public async update(value?: Partial<T>): Promise<number> {
        try {
            const updatedVal = value ?? this._data;
            const lookupVal = this._data[this._idField];

            const result = await this._qb
                .update(updatedVal)
                .where(this._idField, lookupVal);

            return result;
        } catch (e) {
            throw new QueryError(`InductModel.update failed with error ${e}`);
        }
    }

    /* istanbul ignore next */
    public async delete(lookup?: T[keyof T]): Promise<T[keyof T]> {
        try {
            const lookupVal = lookup ?? this._data[this._idField];

            await this._qb.where(this._idField, lookupVal).del();

            return lookupVal;
        } catch (e) {
            throw new QueryError(`InductModel.delete failed with error ${e}`);
        }
    }

    /* istanbul ignore next */
    public async validate(): Promise<ValidationError[]> {
        const result = await validate(this._data);
        this._validated = true;

        return result;
    }
}

export default SqlAdapter;
