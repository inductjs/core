/* istanbul ignore file */
import {getModelForClass, buildSchema} from "@typegoose/typegoose";
import mongoose from "mongoose";
import {CreateQuery} from "mongoose";
import {QueryError} from "../types/error-schema";
import {ValidationError} from "class-validator";
import { InductOptions } from "../types/induct";
import {Strategy} from "./abstract-strategy";

export class MongoStrategy<T> extends Strategy<T> {
    public model: ReturnType<typeof getModelForClass>;
    protected data: T & {_id?: string};
    protected _db: mongoose.Connection;
    protected _idField: keyof (T & {_id?: string});
    protected _fields: Array<keyof T> | keyof T;
    protected _limit: number;
    protected _validated: boolean;
    protected _schemaName: string;

    constructor(values: T, opts: InductOptions<T>) {
        super();

        this._schemaName = opts.schema.name;

        this._db = opts.db as mongoose.Connection;;

        this.model =
            this._db.models[this._schemaName] ??
            this._db.model(this._schemaName, buildSchema(opts.schema));

        this.data = values;
        this._fields = opts.fields;
        this._limit = opts.limit;
        this._idField = opts.idField || "_id";
        this._validated = false;
        
    }

    public async findAll(): Promise<T[]> {
        try {
            const query = this.model.find();

            if (Array.isArray(this._fields) && this._fields.length > 0) {
                query.select(this._fields.join(" "));
            }

            if (!Number.isNaN(this._limit) && this._limit > 0) {
                query.limit(this._limit);
            }

            const result = await query;

            return result || [];
        } catch (e) {
           throw new QueryError(`InductModel.findAll failed with error ${e}`);
        }
    }

    public async findOneById(lookup?: T[keyof T]): Promise<T[]> {
        try {
            const lookupValue = lookup ?? this.data[this._idField];

            const query = this.model.findOne({[this._idField]: lookupValue});

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
            const insertedValue = value ?? this.data;

            const created = await this.model.create<T>(
                insertedValue as CreateQuery<T>
            );

            return created;
        } catch (e) {
            throw new QueryError(`InductModel.create failed with error ${e}`);
        }
    }

    public async update(value?: Partial<T>): Promise<number> {
        try {
            const updatedVal = value ?? this.data;
            const lookupVal = this.data[this._idField];

            const updated = await this.model.findOneAndUpdate(
                {[this._idField]: lookupVal},
                updatedVal,
                {new: true}
            );

            return updated;
        } catch (e) {
            throw new QueryError(`InductModel.update failed with error ${e}`);
        }
    }

    public async delete(lookup?: T[keyof T]): Promise<T> {
        try {
            const lookupVal = lookup ?? this.data[this._idField];

            const deleted = await this.model.findOneAndDelete({
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
            const result = await this.model
                .findOne({[field]: value})
                .select("_id");

            return !!result;
        } catch (e) {
            throw new QueryError(`InductModel.create failed with error ${e}`);
        }
    }
}

export default MongoStrategy;
