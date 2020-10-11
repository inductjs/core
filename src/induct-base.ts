import {
    FunctionOfModel,
    FunctionOfInductModel,
    ModelConstructor,
    Constructor,
} from "./types/model-schema";
import {RequestHandler, Request, Response, Router} from "express";
import {ControllerResultOpts} from "./express/controller-result";
import {
    ok,
    badRequest,
    noContent,
    internalError,
    notFound,
    created,
} from "./express/result-helpers";
import {
    InductModelOpts,
    InductModel,
    BaseOpts,
    OverridableOpts,
    SchemaConstructor,
} from "./types/induct";
import {ValidationError} from "./types/error-schema";
import {Context, HttpRequest, AzureFunction} from "@azure/functions";
import {HttpMethod, HttpResponse} from "azure-functions-ts-essentials";
import {mongoose} from "@typegoose/typegoose";
import Knex from "knex";

export abstract class Induct<T, M extends InductModel<T>> {
    protected _idParam: string;
    protected _idField: keyof T | keyof (T & {_id: string});
    protected _fields: Array<keyof T>;
    protected _validate: boolean;
    protected _db: Knex | mongoose.Connection;
    protected _resultOpts: ControllerResultOpts;

    protected _baseModel: Constructor<M>;
    protected _schema: SchemaConstructor<T>;
    protected _customModel: ModelConstructor<T>;

    constructor(args: BaseOpts<T>) {
        this._idParam = args.idParam || "id";
        this._fields = args.fields;
        this._validate = args.validate;
        this._resultOpts = args.resultOpts;
        this._schema = args.schema;
        this._customModel = args.customModel;
    }

    public router(): Router {
        return Router() // eslint-disable-line new-cap
            .get("/", this.query("findAll"))
            .post("/", this.mutation("create", {validate: true}))
            .patch(
                `/:${this._idParam}`,
                this.mutation("update", {validate: true})
            )
            .get(`/:${this._idParam}`, this.query("findOneById"))
            .delete(`/:${this._idParam}`, this.mutation("delete"));
    }

    async model(
        data: T,
        opts?: InductModelOpts<T>,
        ...args: unknown[]
    ): Promise<InductModel<T> | null> {
        try {
            const modelOpts = this._copyOpts(opts);

            const model = await this._modelFactory(data, modelOpts, ...args);

            return model;
        } catch (e) {
            return null;
        }
    }

    public query<C>(
        modelFn: FunctionOfInductModel<T> | FunctionOfModel<C>,
        opts?: Partial<BaseOpts<T>>
    ): RequestHandler {
        const modelOpts = this._copyOpts(opts);

        return this._createQueryHandler(modelFn as string, modelOpts);
    }

    public mutation<C>(
        modelFn: FunctionOfInductModel<T> | FunctionOfModel<C>,
        opts?: Partial<BaseOpts<T>>
    ): RequestHandler {
        const modelOpts = this._copyOpts(opts);

        return this._createMutationHandler(modelFn as string, modelOpts);
    }

    protected _createQueryHandler(
        modelFn: string,
        opts?: InductModelOpts<T>
    ): RequestHandler {
        this._checkModelFunction(modelFn, opts?.customModel);

        return async (req: Request, res: Response): Promise<Response> => {
            const values = this._valuesFromRequest(req);

            try {
                const result = await this._executeModel(values, modelFn, opts);

                if (result instanceof Error) throw result;

                if (!result || (Array.isArray(result) && result.length == 0)) {
                    if (result === null) {
                        return badRequest(res, this._resultOpts);
                    }

                    if (modelFn === "findAll") {
                        return noContent(res, this._resultOpts);
                    }

                    return notFound(res, this._resultOpts);
                }

                const data =
                    Array.isArray(result) && result.length == 1
                        ? result[0]
                        : result;

                return ok(res, data, this._resultOpts);
            } catch (e) {
                return internalError(res, e);
            }
        };
    }

    protected _createMutationHandler(
        modelFn: string,
        opts?: InductModelOpts<T>
    ): RequestHandler {
        this._checkModelFunction(modelFn, opts?.customModel);

        return async (req: Request, res: Response): Promise<Response> => {
            const values = this._valuesFromRequest(req);

            try {
                const result = await this._executeModel(values, modelFn, opts);

                if (result instanceof Error) throw result;

                if (!result) {
                    if (result === null || modelFn === "create") {
                        return badRequest(res, this._resultOpts);
                    }

                    return notFound(res, this._resultOpts);
                }

                if (modelFn === "create") {
                    return created(res, result, this._resultOpts);
                }

                if (modelFn === "delete") {
                    return noContent(res, this._resultOpts);
                }

                return ok(res, result, this._resultOpts);
            } catch (e) {
                return internalError(res, e, this._resultOpts);
            }
        };
    }

    protected _valuesFromRequest(req: Request): T {
        const values = {...req.body};

        if (req.params[this._idParam]) {
            values[this._idField] = req.params[this._idParam];
        }

        return values;
    }

    protected _checkModelFunction(
        modelFn: string,
        customModel?: ModelConstructor<T>
    ): boolean {
        const modelFunction = customModel
            ? customModel.prototype[modelFn]
            : this._baseModel.prototype[modelFn];

        if (typeof modelFunction !== "function") {
            throw new TypeError(
                `${modelFn} is not a function in the supplied model`
            );
        }

        return true;
    }

    protected async _modelFactory(
        values: T,
        opts: InductModelOpts<T>,
        ...args: unknown[]
    ): Promise<InductModel<T>> {
        const {validate, customModel} = opts;

        // Create model
        const modelInstance = customModel
            ? /* eslint-disable new-cap */
              new customModel(values, opts, ...args)
            : new this._baseModel(values, opts);

        // Validate incoming data
        if (validate) {
            const errors = await modelInstance.validate();

            if (errors.length > 0) {
                throw new ValidationError(`Schema validation failed`);
            }
        }

        return modelInstance;
    }

    protected async _executeModel(
        values: T,
        modelFn: string,
        opts: InductModelOpts<T>
    ): Promise<T | T[] | number | string> {
        try {
            const model = await this._modelFactory(values, opts);

            if (!model) {
                return null;
            }

            const fn = model[modelFn];

            const result = await fn();

            return result;
        } catch (e) {
            return e;
        }
    }

    protected _copyOpts(
        overrides: Partial<OverridableOpts<T>> = {}
    ): InductModelOpts<T> {
        const entries = Object.entries(overrides);

        const thisCopy = Object.assign({}, this) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        const opts = {
            schema: thisCopy._schema,
            validate: thisCopy._validate,
            fields: thisCopy._fields,
            tableName: thisCopy._tableName,
            idField: thisCopy._idField,
            model: thisCopy._model,
            db: thisCopy._db,
            resultOpts: thisCopy._resultOpts,
            customModel: thisCopy._customModel,
        };

        for (const [key, value] of entries) {
            if (value) {
                opts[key] = value;
            }
        }

        return opts;
    }

    public azureHttpTrigger(opts?: Partial<InductModelOpts<T>>): AzureFunction {
        const modelOpts = this._copyOpts(opts);

        return async (
            context: Context,
            req: HttpRequest
        ): Promise<HttpResponse> => {
            const id = req.params?.id;
            const values = {...req.body};

            if (id) values[this._idField] = id;

            let result: T | T[] | number | string | unknown;
            let res: HttpResponse;

            try {
                const Model = await this._modelFactory(values, modelOpts);

                if (!Model) {
                    res = {status: 400, body: "Bad request"};
                } else {
                    switch (req.method) {
                        case HttpMethod.Get:
                            result = id
                                ? await Model.findOneById()
                                : await Model.findAll();

                            if (Array.isArray(result) && result.length === 1) {
                                res = {status: 200, body: result[0]};
                            } else {
                                res = {status: 200, body: result};
                            }

                            break;

                        case HttpMethod.Post:
                            result = await Model.create();
                            res = !result
                                ? {status: 400, body: "Bad request"}
                                : {status: 201, body: result};
                            break;

                        case HttpMethod.Patch:
                            result = await Model.update();
                            res = !result
                                ? {status: 400, body: "Bad request"}
                                : {status: 200, body: result};
                            break;

                        case HttpMethod.Delete:
                            result = (await Model.delete()) as unknown;
                            res = !result
                                ? {status: 404, body: "Resource not found"}
                                : {status: 204, body: result};
                            break;

                        default:
                            res = {status: 405, body: "Method not allowed"};
                            break;
                    }
                }
            } catch (e) {
                res = {status: 500, body: `${e.name}`};
            }

            return res;
        };
    }
}
