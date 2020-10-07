import {InductSQLOpts} from "./types/induct";
import {Induct} from "./induct-base";
import SqlModelBase from "./sql-model-base";
import Knex from "knex";

export class InductSQL<T> extends Induct<T, SqlModelBase<T>> {
    protected _db: Knex;
    protected _tableName: string;

    constructor(opts: InductSQLOpts<T>) {
        super(opts);

        this._db = opts.db;
        this._tableName = opts.tableName;

        this._baseModel = SqlModelBase;
    }
}
