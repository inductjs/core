import {MongoAdapter} from "./adapters/mongo-adapter";
import {InductMongoOpts} from "./types/induct";
import {Induct} from "./induct-base";
import {getModelForClass} from "@typegoose/typegoose";

export class InductMongo<T> extends Induct<T, MongoAdapter<T>> {
    protected _idField: keyof (T & {_id: string});

    constructor(opts: InductMongoOpts<T>) {
        super(opts);

        this._baseModel = MongoAdapter;
        this._db = opts.db;
        this._idField = opts.idField ?? "_id";
        this._customModel = opts.customModel;
    }

    public getMongoModel(
        opts?: InductMongoOpts<T>
    ): ReturnType<typeof getModelForClass> {
        return getModelForClass(opts.schema || this._schema);
    }
}

export default InductMongo;
