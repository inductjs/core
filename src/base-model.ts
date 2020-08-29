/* eslint-disable @typescript-eslint/no-explicit-any */
import knex from "knex";
import {IModel, InductModelOpts} from "./types/model-schema";
import {validate, ValidationError} from "class-validator";

/**
 * Base class for CRUD operation APIs. Takes a generic type parameter based on
 */
export abstract class Model<T> implements IModel<T> {
    /**
     * Tenant database connection object.
     */
    protected _con: knex;
    /**
     * Table name to do queries on
     */
    protected _table_name: string;
    /**
     * Name of the ID field in the table as a string
     */
    protected _id_field: keyof T;
    /**
     * Represents the transaction that the model is using
     */
    protected _trx: knex.Transaction;
    /**
     * Stores the model data
     */
    protected _model: T;

    protected _modelList: T[];
    /**
     * Contains the model options used to generate the model instance
     */
    protected _options: InductModelOpts<T>;
    /**
     * Represents an object that can be used to create new database transactions
     */
    protected trxProvider: any;
    /**
     * Represents whether the model data has been validated
     */
    protected _validated: boolean;

    public fields: Array<keyof T> | string;

    constructor(values: T, opts: InductModelOpts<T>) {
        if (values) this._model = new opts.schema(values); // eslint-disable-line new-cap
        this._table_name = opts.tableName;
        this._con = opts.connection;
        this._id_field = opts.idField;
        this.fields = opts.fields ?? "*";
    }

    get validated(): boolean {
        return this._validated;
    }

    get options(): InductModelOpts<T> {
        return this._options;
    }

    get con(): knex {
        return this._con;
    }

    get table_name(): string {
        return this._table_name;
    }

    get id_field(): keyof T {
        return this._id_field;
    }

    get model(): T {
        return this._model;
    }

    get trx(): knex.Transaction {
        return this._trx;
    }

    public async destroyConnection(): Promise<void> {
        await this._trx.destroy();
    }

    public async startTransaction(): Promise<knex.Transaction> {
        if (this._trx) await this._trx.destroy();

        this._trx = await this._con.transaction();

        return this._trx;
    }

    public async commitTransaction(): Promise<void> {
        this._trx.commit();
    }

    public async rollbackTransaction(): Promise<void> {
        this._trx.rollback();
    }

    public get<K extends keyof T>(prop: K): T[K] {
        return this._model[prop];
    }

    public set<K extends keyof T>(prop: K, value: T[K]): void {
        this._model[prop] = value;
    }

    public async exists<K extends keyof T>(
        column: K,
        value: T[K]
    ): Promise<boolean> {
        const exists = await this._con(this._table_name).where({
            [column]: value,
        });

        return exists.length > 0;
    }

    public abstract async findOneById(lookup?: T[keyof T]): Promise<T[]>;

    public abstract async findAll(): Promise<T[]>;

    public abstract async update(value?: Partial<T>): Promise<T | number>;

    public abstract async create(value?: Partial<T>): Promise<T>;

    public abstract async delete(lookup?: T[keyof T]): Promise<T[keyof T]>;

    public async validate(): Promise<ValidationError[]> {
        return validate(this._model);
    }
}
