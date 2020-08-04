import {InductModelOpts, IModel} from "./types/model-schema";
import {
    InductControllerOpts,
    InductController,
} from "./types/controller-schema";
import {IControllerResult, ControllerResult} from "./controller-result";
import {StatusCode} from "./types/http-schema";

export const createLookupController = <T, M extends IModel<T>>(
    opts: InductControllerOpts<T, M>
): InductController<T> => {
    const {modelFn, modelFactory: factoryFn} = opts;

    return async (
        res,
        factoryParams: Partial<T>,
        opts?: InductModelOpts
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

            const lookup = (await model[modelFn]()) as T[];

            if (lookup.length == 0) {
                result = {
                    res,
                    status: StatusCode.NOT_FOUND,
                };
            } else {
                const data = lookup.length === 1 ? lookup[0] : lookup;

                result = {
                    res,
                    status: StatusCode.OK,
                    data,
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
