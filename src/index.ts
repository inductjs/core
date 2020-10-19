/* eslint-disable @typescript-eslint/no-namespace */
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

export {metaHandler} from "./express/meta-handler";
export { SqlStrategy} from "./strategies/sql-strategy";
export { MongoStrategy } from "./strategies/mongo-strategy";

// v0.6 beta API and Types
export { ApplicationOpts } from "./types/ApplicationOptions";
export { Application, createApp as induct } from "./induct-app";
export { createController } from "./controller-factory";
export { Controller } from "./induct-controller";

export { InductOptions } from "./types/induct"

export default InductSQL;
