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
export { ApplicationOpts } from "./v0.6/types/ApplicationOptions";
export { Application, induct } from "./v0.6/induct-app";
export { createController } from "./v0.6/controller-factory";
export { Controller } from "./v0.6/induct-controller";
export { SqlStrategy} from "./v0.6/strategies/sql-strategy";
export { MongoStrategy } from "./v0.6/strategies/mongo-strategy";
export { InductOptions } from "./v0.6/types"

export default InductSQL;
