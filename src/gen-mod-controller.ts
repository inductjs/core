import {InductModel} from "./gen-model";
import {InductControllerOpts} from "./types/controller-schema";
import {StatusCode} from "./types/http-schema";

import {IControllerResult, ControllerResult} from "./controller-result";
import {Request, Response, NextFunction, RequestHandler} from "express";

/**
 * Returns a generic controller function for POST, PATCH, and DELETE routes;
 * @param opts InductControllerOpts
 * @example
 * const controller = createModController({
 *      modelFactory: createModelFactory(['user_id', 'username'], UserModel),
 *      modelFn: 'create'
 * })
 */
export const createModController = <T, M extends InductModel<T>>(
    opts: InductControllerOpts<T, M>
): RequestHandler => {
    const {modelFn, modelFactory, modelOpts} = opts;

    return async (
        req: Request,
        res: Response,
        next?: NextFunction
    ): Promise<Response> => {
        let result: IControllerResult<T>;

        try {
            const model = await modelFactory(req.body, modelOpts);

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
        return new ControllerResult(result).send();
    };
};
