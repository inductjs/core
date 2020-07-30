import {ModelOptions, IModel} from "./types/model-schema";
import {ControllerFunctionOptions, Controller} from "./types/controller-schema";
import {StatusCode} from "./types/http-schema";

import {IControllerResult, ControllerResult} from "./controller-result";

export const createModController = <T, M extends IModel<T>>(
    opts: ControllerFunctionOptions<T, M>
): Controller<T> => {
    const {modelFn, factoryFn} = opts;

    return async (
        res,
        factoryParams: Partial<T>,
        opts?: ModelOptions
    ): Promise<ControllerResult<T>> => {
        let result: IControllerResult<T>;

        try {
            const model = await factoryFn(factoryParams, opts);

            if (!model) {
                return new ControllerResult({
                    res,
                    status: StatusCode.BAD_REQUEST,
                });
            }

            if (typeof model[modelFn] !== "function") {
                throw new TypeError(
                    `${modelFn} is not a function of the supplied model`
                );
            }

            const modified = (await model[modelFn]()) as T;

            if (!modified) {
                const failStatus =
                    modelFn === "create"
                        ? StatusCode.BAD_REQUEST
                        : StatusCode.NOT_FOUND;

                result = {
                    res,
                    status: failStatus,
                };
            } else {
                let sucStatus: StatusCode = StatusCode.OK;

                if (modelFn === "create") {
                    sucStatus = StatusCode.CREATED;
                } else if (modelFn === "delete") {
                    sucStatus = StatusCode.NO_CONTENT;
                }

                result = {
                    res,
                    status: sucStatus,
                    data: modified,
                };
            }
        } catch (e) {
            result = {
                res,
                status: StatusCode.INTERNAL_SERVER_ERROR,
                error: e,
            };
        }
        return new ControllerResult(result);
    };
};
