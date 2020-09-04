import {
    InductModelOpts,
    ModelFactory,
    SchemaConstructor,
    ModelConstructor,
    FunctionName,
} from "./types/model-schema";
import {InductModel} from "./base-model";
import {IControllerResult, ControllerResult} from "./controller-result";
import {inductModelFactory} from "./model-factory";
import {StatusCode} from "./types/http-schema";
import {RequestHandler, Request, Response, Router} from "express";
import {AzureFunction, Context, HttpRequest} from "@azure/functions";
import {HttpResponse, HttpMethod} from "azure-functions-ts-essentials";
import knex from "knex";

export interface InductConstructorOpts<T> extends InductModelOpts<T> {
    /** url parameter for resource ID's. Default = "id" */
    idParam?: string;
}

export class Induct<T> {
    private connection: knex;
    private idField: keyof T;
    private idParam: string;
    private fieldsList: Array<keyof T>;
    private tableName: string;
    private validate: boolean;

    private schema: SchemaConstructor<T>;
    private _model: ModelConstructor<T>;

    private modelFactory: ModelFactory<T>;

    constructor(args: InductConstructorOpts<T>) {
        this.connection = args.connection;
        this.schema = args.schema;
        this.idField = args.idField;
        this.tableName = args.tableName;
        this.idParam = args.idParam || "id";

        this.fieldsList = args.fields;

        this.validate = args.validate;
        this._model = args.customModel;

        this.modelFactory = inductModelFactory;
    }

    private _copyOpts(
        overrides: Partial<InductModelOpts<T>> = {}
    ): InductModelOpts<T> {
        const overrideEntries = Object.entries(overrides);

        // Get existing options in the instance
        const {
            validate,
            fieldsList,
            schema,
            connection,
            tableName,
            idField,
            _model,
        } = this;

        const opts = {
            validate,
            fields: fieldsList,
            schema,
            connection,
            tableName,
            idField,
            customModel: _model,
        };

        // Override options
        for (const [key, value] of overrideEntries) {
            opts[key] = value;
        }

        return opts;
    }

    async model(data: T, opts?: InductModelOpts<T>): Promise<InductModel<T>> {
        try {
            const modelOpts = this._copyOpts(opts);

            const model = await inductModelFactory(data, modelOpts);

            return model;
        } catch (e) {
            console.log(e); // eslint-disable-line no-console
        }
    }

    handler<R extends InductModel<T>>(
        modelFn: FunctionName<R>,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        const fn = modelFn.toString();

        try {
            if (modelFn.toString().indexOf("find") !== -1) {
                return this.lookupHandler(fn, opts);
            } else {
                return this.modifyHandler(fn, opts);
            }
        } catch (e) {
            console.log(e); // eslint-disable-line no-console
        }
    }

    private lookupHandler<R extends InductModel<T>>(
        modelFn: FunctionName<R>,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        const modelOpts = this._copyOpts(opts);
        const fn = modelFn.toString();

        return async (req: Request, res: Response): Promise<Response> => {
            let result: IControllerResult<T>;

            const values = {...req.body};

            if (modelFn === "findOneById") {
                values[this.idField] = req.params.id;
            }

            try {
                const model = await this.modelFactory(values, modelOpts);

                if (!model) {
                    return new ControllerResult({
                        res,
                        status: StatusCode.BAD_REQUEST,
                    }).send();
                }

                if (typeof model[fn] !== "function") {
                    throw new TypeError(
                        `${modelFn} is not a function of the supplied model`
                    );
                }

                const lookup = (await model[modelFn]()) as Array<T>;

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
    }

    private modifyHandler<R extends InductModel<T>>(
        modelFn: FunctionName<R>,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        const modelOpts = this._copyOpts(opts);

        return async (req: Request, res: Response): Promise<Response> => {
            let result: IControllerResult<T>;

            const values = {...req.body};

            if (modelFn === "update" || modelFn === "delete") {
                values[this.idField] = req.params[this.idParam];
            }

            try {
                const model = await this.modelFactory(values, modelOpts);

                if (!model) {
                    return new ControllerResult({
                        res,
                        status: StatusCode.BAD_REQUEST,
                    }).send();
                }

                if (model[modelFn] === "function") {
                    const modified = await model[modelFn]();

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
                } else {
                    throw new TypeError(
                        `${modelFn} is not a function of the supplied model`
                    );
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
    }

    public azureFunctionsRouter(
        opts?: Partial<InductModelOpts<T>>
    ): AzureFunction {
        const modelOpts = this._copyOpts(opts);

        return async (
            context: Context,
            req: HttpRequest
        ): Promise<HttpResponse> => {
            const id = req.params?.id;
            const values = {...req.body};

            if (id) values[this.idField] = id;

            let result: T | T[] | number | string | unknown;
            let res: HttpResponse;

            try {
                const Model = await this.modelFactory(values, modelOpts);

                if (!Model) {
                    res = {status: 400, body: "Bad request"};
                } else {
                    switch (req.method) {
                        case HttpMethod.Get:
                            result = id
                                ? await Model.findOneById()
                                : await Model.findAll();
                            res = {status: 200, body: result};
                            break;

                        case HttpMethod.Post:
                            result = await Model.create();
                            res = {status: 201, body: result};
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

            if (!res) return {status: 400, body: `Bad request`};
            else return res;
        };
    }

    public router(): Router {
        const router = Router(); // eslint-disable-line new-cap

        router.get("/", this.lookupHandler("findAll"));

        router.post("/", this.modifyHandler("create", {validate: true}));
        router.patch("/:id", this.modifyHandler("update", {validate: true}));

        router.get("/:id", this.lookupHandler("findOneById"));
        router.delete("/:id", this.modifyHandler("delete"));

        return router;
    }
}
