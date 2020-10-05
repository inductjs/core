import Induct, {InductConstructorOpts} from "../induct";
import {
    FunctionOfModel,
    FunctionOfInductModel,
    InductModelOpts,
    ModelConstructor,
} from "../types/model-schema";
import {InductModel} from "../base-model";
import {RequestHandler, Request, Response, Router} from "express";
import {ControllerResultOpts} from "./controller-result";
import {
    ok,
    badRequest,
    noContent,
    internalError,
    notFound,
    created,
} from "./result-helpers";

export interface ExpressConstructorOpts<T> extends InductConstructorOpts<T> {
    /** Options to determine the output of the controller result and format of the response body */
    resultOpts?: ControllerResultOpts;
}

export class InductExpress<T> extends Induct<T> {
    private resultOpts: ControllerResultOpts;

    constructor(args: ExpressConstructorOpts<T>) {
        super(args);

        this.resultOpts = args.resultOpts;
    }

    public router(): Router {
        return Router() // eslint-disable-line new-cap
            .get("/", this.query("findAll"))
            .post("/", this.mutation("create", {validate: true}))
            .patch("/:id", this.mutation("update", {validate: true}))
            .get("/:id", this.query("findOneById"))
            .delete("/:id", this.mutation("delete"));
    }

    query<M>(
        modelFn: FunctionOfInductModel<T> | FunctionOfModel<M>,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        const modelOpts = this._copyOpts(opts);

        return this._createQueryHandler(modelFn as string, modelOpts);
    }

    mutation<M>(
        modelFn: FunctionOfInductModel<T> | FunctionOfModel<M>,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        const modelOpts = this._copyOpts(opts);

        return this._createMutationHandler(modelFn as string, modelOpts);
    }

    private _createQueryHandler(
        modelFn: string,
        opts?: InductModelOpts<T>
    ): RequestHandler {
        this._checkModelFunction(modelFn, opts?.customModel);

        return async (req: Request, res: Response): Promise<Response> => {
            const values = this._valuesFromRequest(req);

            try {
                const result = await this._executeModel(values, modelFn, opts);

                if (!result || (Array.isArray(result) && result.length == 0)) {
                    if (result === null) {
                        return badRequest(res, this.resultOpts);
                    }

                    return notFound(res, this.resultOpts);
                }

                const data =
                    Array.isArray(result) && result.length == 1
                        ? result[0]
                        : result;

                return ok(res, data, this.resultOpts);
            } catch (e) {
                return internalError(res, e);
            }
        };
    }

    private _createMutationHandler(
        modelFn: string,
        opts?: InductModelOpts<T>
    ): RequestHandler {
        this._checkModelFunction(modelFn, opts?.customModel);

        return async (req: Request, res: Response): Promise<Response> => {
            const values = this._valuesFromRequest(req);

            try {
                const result = await this._executeModel(values, modelFn, opts);


                if (!result) {
                    if (result === null || modelFn === "create") {
                        return badRequest(res, this.resultOpts);
                    }

                    if (result === null) console.log("oeps");

                    return notFound(res, this.resultOpts);
                }

                if (modelFn === "create") {
                    return created(res, result, this.resultOpts);
                }

                if (modelFn === "delete") {
                    return noContent(res, this.resultOpts);
                }

                return ok(res, result, this.resultOpts);
            } catch (e) {
                return internalError(res, e, this.resultOpts);
            }
        };
    }

    private _checkModelFunction(
        modelFn: string,
        customModel: ModelConstructor<T>
    ): boolean {
        const modelFunction = customModel
            ? customModel.prototype[modelFn]
            : InductModel.prototype[modelFn];

        if (typeof modelFunction !== "function") {
            throw new TypeError(
                `${modelFn} is not a function in the supplied model`
            );
        }

        return true;
    }

    private async _executeModel(
        values: T,
        modelFn: string,
        opts: InductModelOpts<T>
    ): Promise<T | T[] | number | string> {
        const model = await this.modelFactory(values, opts);

        if (!model) {
            return null;
        }

        const fn = model[modelFn];

        const result = await fn();

        return result;
    }

    private _valuesFromRequest(req: Request): T {
        const values = {...req.body};

        if (req.params[this.idParam]) {
            values[this.idField] = req.params[this.idParam];
        }

        return values;
    }
}
