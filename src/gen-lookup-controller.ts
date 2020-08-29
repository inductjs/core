import {InductModelOpts, IModel} from "./types/model-schema";
import {
    InductControllerOpts,
    InductController,
} from "./types/controller-schema";
import {IControllerResult, ControllerResult} from "./controller-result";
import {StatusCode} from "./types/http-schema";
import {RequestHandler, Request, Response, NextFunction} from "express";

export const createLookupHandler = <T, M extends IModel<T>>(
    opts: InductControllerOpts<T, M>
): RequestHandler => {
    const {modelFn, modelFactory: factoryFn, modelOpts} = opts;

    return async (
        req: Request,
        res: Response,
        next?: NextFunction
    ): Promise<Response> => {
        let result: IControllerResult<T>;

        try {
            const model = await factoryFn(req.body, modelOpts);

            if (!model) {
                return new ControllerResult({
                    res,
                    status: StatusCode.BAD_REQUEST,
                }).send();
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

        const controllerResult = new ControllerResult(result);

        return controllerResult.send();
    };
};
