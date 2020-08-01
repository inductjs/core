export {
    InductController,
    InductControllerOpts,
    InductControllerBase as IControllerBase,
} from "./types/controller-schema";

export {ValidationError, QueryError} from "./types/error-schema";

export {StatusCode} from "./types/http-schema";

export {
    InductModelFactory as ModelFactory,
    ModelFunction,
    InductModelOpts as ModelOptions,
    IModel,
    InductModelFunction as BaseModelFunction,
    ValidationResult,
} from "./types/model-schema";

export {Model} from "./base-model";

export {IControllerResult, ControllerResult} from "./controller-result";

import {createLookupController} from "./gen-lookup-controller";
export {createLookupController} from "./gen-lookup-controller";

import {createModController} from "./gen-mod-controller";
export {createModController} from "./gen-mod-controller";

import {createModelFactory} from "./gen-model";
export {createModelFactory} from "./gen-model";

export default {
    createModController,
    createLookupController,
    createModelFactory,
};
