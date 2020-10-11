import {getModelForClass, buildSchema} from "@typegoose/typegoose";
import mongoose from "mongoose";
import {CreateQuery} from "mongoose";
import {QueryError} from "../types/error-schema";
import {ValidationError} from "class-validator";
import {InductMongoOpts} from "../types/induct";
import InductAdapter from "./abstract-adapter";

export class MongoAdapter<T> extends InductAdapter<T> {
    public mongo: ReturnType<typeof getModelForClass>;
    protected _db: mongoose.Connection;
    protected _data: T & {_id?: string};
    protected _idField: keyof (T & {_id?: string});
    protected _fields: Array<keyof T> | keyof T;
    protected _limit: number;
    protected _validated: boolean;
    protected _schemaName: string;

    constructor(values: T, opts: InductMongoOpts<T>) {
        super();

        this._schemaName = opts.schema.name;
        this._db = opts.db;

        this.mongo =
            this._db.models[this._schemaName] ??
            this._db.model(this._schemaName, buildSchema(opts.schema));

        this._data = values;
        this._fields = opts.fields;
        this._limit = opts.limit;
        this._validated = false;
    }

    public get<K extends keyof T>(prop: K): T[K] {
        return this._data[prop];
    }

    public set<K extends keyof T>(prop: K, value: T[K]): void {
        this._data[prop] = value;
    }

    public async findAll(): Promise<T[]> {
        try {
            const query = this.mongo.find();

            if (Array.isArray(this._fields) && this._fields.length > 0) {
                query.select(this._fields.join(" "));
            }

            if (!Number.isNaN(this._limit) && this._limit > 0) {
                query.limit(this._limit);
            }

            const result = await query;

            return result || [];
        } catch (e) {
            console.log(e);
        }
    }

    public async findOneById(lookup?: T[keyof T]): Promise<T[]> {
        try {
            const lookupValue = lookup ?? this._data[this._idField];

            const query = this.mongo.findOne({[this._idField]: lookupValue});

            if (Array.isArray(this._fields) && this._fields.length > 0) {
                query.select(this._fields.join(" "));
            }

            const result = await query;

            return result || [];
        } catch (e) {
            throw new QueryError(`InductModel.create failed with error ${e}`);
        }
    }

    public async create(value?: Partial<T>): Promise<T> {
        try {
            const insertedValue = value ?? this._data;

            const created = await this.mongo.create<T>(
                insertedValue as CreateQuery<T>
            );

            return created;
        } catch (e) {
            throw new QueryError(`InductModel.create failed with error ${e}`);
        }
    }

    public async update(value?: Partial<T>): Promise<number> {
        try {
            const updatedVal = value ?? this._data;
            const lookupVal = this._data[this._idField];

            const updated = await this.mongo.findOneAndUpdate(
                {[this._idField]: lookupVal},
                updatedVal
            );

            return updated;
        } catch (e) {
            throw new QueryError(`InductModel.update failed with error ${e}`);
        }
    }

    public async delete(
        lookup?: T[keyof T]
    ): Promise<{ok?: number; n?: number}> {
        try {
            const lookupVal = lookup ?? this._data[this._idField];

            const deleted = await this.mongo.findOneAndDelete({
                [this._idField]: lookupVal,
            });

            return deleted;
        } catch (e) {
            throw new QueryError(`InductModel.delete failed with error ${e}`);
        }
    }

    public async validate(): Promise<ValidationError[]> {
        this._validated = true;
        return [];
    }

    public async exists<K extends keyof T>(
        field: K,
        value: T[K]
    ): Promise<boolean> {
        try {
            const result = await this.mongo
                .findOne({[field]: value})
                .select("_id");

            return !!result;
        } catch (e) {
            throw new QueryError(`InductModel.create failed with error ${e}`);
        }
    }
}

export default MongoAdapter;
