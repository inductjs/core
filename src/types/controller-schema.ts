import {Request, Response, NextFunction} from 'express';
import {ModelFactory, BaseModelFunction, ModelOptions} from './model-schema';
import {ControllerResult} from '../controller-result';

export type Controller<T> = (
    response: Response,
    factoryParams: Partial<T>,
    modelOpts?: ModelOptions
) => Promise<ControllerResult<T>>;

export interface ControllerFunctionOptions<T, M> {
    /** Model factory function */
    factoryFn: ModelFactory<T, M>;
    /** Name of the model function that the controller should call */
    modelFn: BaseModelFunction;
    /** Options that should be provided to the model factory */
    modelOpts?: ModelOptions;
}

export interface IControllerBase {
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
