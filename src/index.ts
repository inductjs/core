export {
    Controller as InductController,
    InductControllerOpts,
    InductControllerBase,
} from "./types/controller-schema";
export {ValidationError, QueryError} from "./types/error-schema";
export {StatusCode} from "./types/http-schema";
export {
    InductModelOpts,
    IInductModel,
    ValidationResult,
} from "./types/model-schema";
export {InductModel} from "./base-model";
export {IControllerResult, ControllerResult} from "./controller-result";
export {InductConstructorOpts} from "./induct";

import {Induct} from "./induct";
import {InductExpress} from "./induct-express";
import {InductAzure} from "./induct-azure";
import {modelFactory} from "./model-factory";

export {Induct, InductExpress, InductAzure, modelFactory};

export default {
    Induct,
    InductExpress,
    InductAzure,
    modelFactory,
};
