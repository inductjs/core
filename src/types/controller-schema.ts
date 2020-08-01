import {Request, Response, NextFunction} from "express";
import {InductModelFactory, InductModelFunction, InductModelOpts} from "./model-schema";
import {ControllerResult} from "../controller-result";

export type InductController<T> = (
    response: Response,
    factoryParams: Partial<T>,
    modelOpts?: InductModelOpts
) => Promise<ControllerResult<T>>;

export interface InductControllerOpts<T, M> {
    modelFactory: InductModelFactory<T, M>;
    /** Name of the model function that the controller should call */
    modelFn: InductModelFunction;
    /** Options that should be provided to the model factory */
    modelOpts?: InductModelOpts;
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
