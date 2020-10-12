import {MongoAdapter} from "../adapters/mongo-adapter";
import {InductMongoOpts} from "../types/induct";
import {InductControllerBase} from "./induct-base-controller";
import {getModelForClass, mongoose} from "@typegoose/typegoose";

export class MongoController<T> extends InductControllerBase<T, MongoAdapter<T>> {
    protected _db: mongoose.Connection;
    protected _idField: keyof (T & {_id: string});

    constructor(opts: InductMongoOpts<T>) {
        super(opts);
        // Only override db if explicitly set in options
        if (opts.db) this._db = opts.db;

        this._baseModel = MongoAdapter;
        this._idField = opts.idField ?? "_id";
    }

    public getMongoModel(
        opts?: InductMongoOpts<T>
    ): ReturnType<typeof getModelForClass> {
        return getModelForClass(opts.schema || this._schema);
    }
}

export default MongoController;
