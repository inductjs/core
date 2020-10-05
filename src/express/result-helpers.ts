import ControllerResult, {
    IControllerResult,
    ControllerResultOpts,
} from "./controller-result";
import {HttpStatusCode} from "azure-functions-ts-essentials";
import {Response} from "express";

export const ok = <T>(
    res: Response,
    data?: T,
    opts?: ControllerResultOpts
): Response => {
    const result: IControllerResult<T> = {
        res,
        status: HttpStatusCode.OK,
        data,
    };

    return new ControllerResult(result, opts).send();
};

export const badRequest = <T>(
    res: Response,
    opts?: ControllerResultOpts
): Response => {
    const result: IControllerResult<T> = {
        res,
        status: HttpStatusCode.BadRequest,
    };

    return new ControllerResult(result, opts).send();
};

export const notFound = <T>(
    res: Response,
    opts?: ControllerResultOpts
): Response => {
    const result: IControllerResult<T> = {
        res,
        status: HttpStatusCode.NotFound,
    };

    return new ControllerResult(result, opts).send();
};

export const noContent = <T>(
    res: Response,
    opts?: ControllerResultOpts
): Response => {
    const result: IControllerResult<T> = {
        res,
        status: HttpStatusCode.NoContent,
    };

    return new ControllerResult(result, opts).send();
};

export const created = <T>(
    res: Response,
    data?: T,
    opts?: ControllerResultOpts
): Response => {
    const result: IControllerResult<T> = {
        res,
        status: HttpStatusCode.Created,
        data,
    };

    return new ControllerResult(result, opts).send();
};

export const internalError = <T>(
    res: Response,
    error?: Error,
    opts?: ControllerResultOpts
): Response => {
    const result: IControllerResult<T> = {
        res,
        status: HttpStatusCode.InternalServerError,
        error,
    };

    return new ControllerResult(result, opts).send();
};

export const conflict = <T>(
    res: Response,
    opts?: ControllerResultOpts
): Response => {
    const result: IControllerResult<T> = {
        res,
        status: HttpStatusCode.Conflict,
    };

    return new ControllerResult(result, opts).send();
};
