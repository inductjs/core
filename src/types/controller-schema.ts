import {Request, Response, NextFunction} from "express";
import {BaseOpts} from "./induct";
import {ControllerResult} from "../express/controller-result";

export type Controller<T> = (
    response: Response,
    modelOpts: BaseOpts<T>
) => Promise<ControllerResult<T>>;

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
