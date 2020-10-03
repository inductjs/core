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
} from "../result-helpers";
import {keys} from "ts-transformer-keys";

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
        const router = Router(); // eslint-disable-line new-cap

        router.get("/", this.query("findAll"));

        router.post("/", this.mutation("create", {validate: true}));
        router.patch("/:id", this.mutation("update", {validate: true}));

        router.get("/:id", this.query("findOneById"));
        router.delete("/:id", this.mutation("delete"));

        return router;
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
        this._checkModelFunction(modelFn, opts.customModel);

        return async (req: Request, res: Response): Promise<Response> => {
            const values = this._valuesFromRequest(req)

            try {
                const result = await this._executeModel(values, modelFn, opts)

                if (!result || (Array.isArray(result) && result.length == 0)) {
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
        this._checkModelFunction(modelFn, opts.customModel)

        return async (req: Request, res: Response): Promise<Response> => {                
            const values = this._valuesFromRequest(req)
            
            try {
                const result = await this._executeModel(values, modelFn, opts);

                if (!result) {
                    if (result === null || modelFn === "create") {
                        return badRequest(res, this.resultOpts);
                    }

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
        customModel: ModelConstructor<T>,
    ){
        const targetProp = customModel
            ? customModel.prototype[modelFn]
            : keys<InductModel<T>>();

        if (typeof targetProp !== "function") {
            throw new TypeError(
                `${modelFn} is not a function in the supplied model`
            );
        }
        
        return true;
    }

    private async _executeModel(
        values: any,
        modelFn: string,
        opts: InductModelOpts<T>
    ) {
        const model = await this.modelFactory(values, opts);

        if (!model) {
            return null;
        }

        const fn = model[modelFn];

        const result = await fn();

        return result;
    }

    private async _valuesFromRequest(req: Request) {
        const values = {...req.body};

        if (req.params[this.idParam]) {
            values[this.idField] = req.params[this.idParam];
        }

        return values;
    }
}
