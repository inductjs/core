import {Request, Response, NextFunction} from "express";
import {
    InductModelFactory,
    BaseModelFunction,
    InductModelOpts,
} from "./model-schema";
import {ControllerResult} from "../controller-result";

export type InductController<T> = (
    response: Response,
    modelOpts: InductModelOpts<T>
) => Promise<ControllerResult<T>>;

export interface InductControllerOpts<T, M> {
    /** Name of the model function that the controller should call */
    modelFn: BaseModelFunction;
}

export interface InductControllerBase {
    getById: (
        req: Request,
        res: Response,
        next?: NextFunction
    ) => Promise<Response>;
    getAll: (
        req: Request,
        res: Response,
        next?: NextFunction
    ) => Promise<Response>;
    post: (
        req: Request,
        res: Response,
        next?: NextFunction
    ) => Promise<Response>;
    patch: (
        req: Request,
        res: Response,
        next?: NextFunction
    ) => Promise<Response>;
    delete: (
        req: Request,
        res: Response,
        next?: NextFunction
    ) => Promise<Response>;
}
