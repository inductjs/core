export {
    Controller as InductController,
    InductControllerBase,
} from "./types/controller-schema";
export {ValidationError, QueryError} from "./types/error-schema";
export {
    IInductSqlModel as IInductModel,
    ValidationResult,
    FunctionOfModel,
    FunctionType,
    FunctionOfInductModel,
} from "./types/model-schema";

export {BaseOpts, InductSQLOpts, InductMongoOpts} from "./types/induct";

export {SqlModelBase as InductSqlModel} from "./sql-model-base";
export {IControllerResult, ControllerResult} from "./express/controller-result";
export {BaseOpts as InductBaseOpts} from "./types/induct";

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

import {metaHandler} from "./express/meta-handler";
import {SqlModelBase} from "./sql-model-base";
import {MongoModelBase} from "./mongo-model-base";
import {InductSQL} from "./induct-sql";
import {InductMongo} from "./induct-mongo";
import {InductServer, createServer} from "./express/express-entry";

export {
    InductMongo,
    InductSQL,
    SqlModelBase,
    MongoModelBase,
    metaHandler,
    InductServer,
    createServer,
};

export default InductSQL;
