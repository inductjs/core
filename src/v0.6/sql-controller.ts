import {InductSQLOpts} from "../types/induct";
import {InductControllerBase} from "./induct-base-controller";
import SqlAdapter from "../adapters/sql-adapter";
import Knex from "knex";

export class SqlController<T> extends InductControllerBase<T, SqlAdapter<T>> {
    protected _db: Knex;
    protected _tableName: string;

    constructor(opts: InductSQLOpts<T>) {
        super(opts);

        if (opts.db) this._db = opts.db;
        this._tableName = opts.tableName;
        this._idField = opts.idField;

        this._baseModel = SqlAdapter;
    }
}
