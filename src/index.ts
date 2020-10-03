export {
    Controller as InductController,
    InductControllerOpts,
    InductControllerBase,
} from "./types/controller-schema";
export {ValidationError, QueryError} from "./types/error-schema";
export {
    InductModelOpts,
    IInductModel,
    ValidationResult,
    FunctionOfModel,
    FunctionType,
    FunctionOfInductModel,
} from "./types/model-schema";
export {InductModel} from "./base-model";
export {IControllerResult, ControllerResult} from "./express/controller-result";
export {InductConstructorOpts} from "./induct";
export {
    ok,
    badRequest,
    noContent,
    internalError,
    conflict,
    notFound,
    created,
} from "./result-helpers";

import {Induct} from "./induct";
import {InductExpress} from "./express/induct-express";
import {InductAzure} from "./azure/induct-azure";
import {modelFactory} from "./model-factory";
export {metaHandler} from "./express/meta-handler";

export {Induct, InductExpress, InductAzure, modelFactory};

export default {
    Induct,
    InductExpress,
    InductAzure,
    modelFactory,
};
