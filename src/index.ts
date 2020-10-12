/* eslint-disable @typescript-eslint/no-namespace */

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
    forbidden,
    unauthorized,
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

// v0.6 beta API and Types
export { ApplicationOpts } from "./v0.6/app-schema";
export { InductApp, induct } from "./v0.6/induct-app";
export { controller } from "./v0.6/controller-factory";
export { InductControllerBase } from "./v0.6/induct-base-controller";
export { SqlController} from "./v0.6/sql-controller";
export { MongoController } from "./v0.6/mongo-controller";

export default InductSQL;
