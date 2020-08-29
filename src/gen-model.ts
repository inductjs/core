import {QueryError} from "./types/error-schema";
import {Model} from "./base-model";
import knex from "knex";

class InductModel<T> extends Model<T> {
    public fields: string[] | string;
    readonly _qb: knex.QueryBuilder;

    constructor(
        values: T,
        schema: new (values: T) => T,
        con: knex,
        fields?: string[]
    ) {
        super(values, schema, con);
        // Select all fields if fields list is not supplied
        this.fields = fields ?? "*";
        this._qb = this.con(this._table_name);
    }

    async findAll(): Promise<T[]> {
        try {
            const result = await this._qb.select(this.fields);

            return result;
        } catch (e) {
            throw new QueryError(`InductModel.findAll failed with error ${e}`);
        }
    }

    async findOneById(lookup?: string | number): Promise<T[]> {
        try {
            const lookupValue = lookup ?? this._model[this._id_field];

            const result = this._qb
                .select(this.fields)
                .where(this._id_field, lookupValue);

            return result;
        } catch (e) {
            throw new QueryError(
                `InductModel.findOneById failed with error ${e}`
            );
        }
    }

    async create(value?: Partial<T>): Promise<T> {
        try {
            const insertedValue = value ?? this._model;

            await this._qb.insert(insertedValue);

            return this._model;
        } catch (e) {
            throw new QueryError(`InductModel.create failed with error ${e}`);
        }
    }

    async update(value?: Partial<T>): Promise<number> {
        try {
            const updatedVal = value ?? this._model;
            const lookupVal = this._model[this._id_field];

            const result = await this._qb
                .update(updatedVal)
                .where(this._id_field, lookupVal);

            return result;
        } catch (e) {
            throw new QueryError(`InductModel.update failed with error ${e}`);
        }
    }

    async delete(lookup?: number | string): Promise<number | string> {
        try {
            const lookupVal = lookup ?? this._model[this._id_field];

            await this._qb.where(this._id_field, lookupVal).del();

            return lookup;
        } catch (e) {
            throw new QueryError(`InductModel.delete failed with error ${e}`);
        }
    }
}

export {InductModel};
