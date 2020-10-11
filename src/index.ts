export {InductSQLOpts, InductMongoOpts} from "./types/induct";
export {ControllerResult} from "./express/controller-result";

export {getModelForClass, prop} from "@typegoose/typegoose";

export {
    ok,
    badRequest,
    noContent,
    internalError,
    conflict,
    notFound,
    created,
} from "./express/result-helpers";

import {SqlAdapter} from "./adapters/sql-adapter";
import {MongoAdapter} from "./adapters/mongo-adapter";
import {InductAdapter} from "./adapters/abstract-adapter";

import {metaHandler} from "./express/meta-handler";
import {InductServer, createServer} from "./express/server";

import {InductSQL} from "./induct-sql";
import {InductMongo} from "./induct-mongo";

export {
    InductMongo,
    InductSQL,
    InductAdapter,
    InductServer,
    SqlAdapter,
    MongoAdapter,

    metaHandler,
    createServer,
};

export default InductSQL;
