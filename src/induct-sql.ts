import {InductSQLOpts} from "./types/induct";
import {Induct} from "./induct-base";
import SqlAdapter from "./adapters/sql-adapter";
import Knex from "knex";

export class InductSQL<T> extends Induct<T, SqlAdapter<T>> {
    protected _db: Knex;
    protected _tableName: string;

    constructor(opts: InductSQLOpts<T>) {
        super(opts);

        this._db = opts.db;
        this._tableName = opts.tableName;
        this._idField = opts.idField;
        this._customModel = opts.customModel;

        this._baseModel = SqlAdapter;
    }
}
