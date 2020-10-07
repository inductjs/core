import {MongoModelBase} from "./mongo-model-base";
import {InductMongoOpts} from "./types/induct";
import {Induct} from "./induct-base";
import {getModelForClass, mongoose} from "@typegoose/typegoose";

export class InductMongo<T> extends Induct<T, MongoModelBase<T>> {
    constructor(opts: InductMongoOpts<T>) {
        super(opts);

        this._baseModel = MongoModelBase;
        this._schema = opts.schema;
        this._db = opts.db;
    }

    public getMongoModel(
        opts?: InductMongoOpts<T>
    ): ReturnType<typeof getModelForClass> {
        return getModelForClass(opts.schema || this._schema);
    }
}

export default InductMongo;
