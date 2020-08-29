export {
    InductController,
    InductControllerOpts,
    InductControllerBase,
} from "./types/controller-schema";

export {ValidationError, QueryError} from "./types/error-schema";

export {StatusCode} from "./types/http-schema";

export {
    InductModelFactory,
    InductModelFunction,
    InductModelOpts,
    IModel,
    ValidationResult,
} from "./types/model-schema";

export {InductModel} from "./gen-model";

export {Model as InductBaseModel} from "./base-model";

export {IControllerResult, ControllerResult} from "./controller-result";

import {createLookupController} from "./gen-lookup-controller";
export {createLookupController} from "./gen-lookup-controller";

import {createModController} from "./gen-mod-controller";
export {createModController} from "./gen-mod-controller";

import {createModelFactory} from "./gen-model-factory";
export {createModelFactory} from "./gen-model-factory";

import {createAzureFunctionsRouter} from "./gen-functions-router";
export {createAzureFunctionsRouter} from "./gen-functions-router";

export default {
    createModController,
    createLookupController,
    createModelFactory,
    createAzureFunctionsRouter,
};
