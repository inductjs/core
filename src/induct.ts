import {
    InductModelOpts,
    ModelFactory,
    SchemaConstructor,
    ModelConstructor,
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
    /** Additional method names to support for creating POST,PATCH,DELETE handlers */
    additionalModifyFunctions?: string[];
    /** Additional method names to support for creating GET handlers */
    additionalLookupFunctions?: string[];
}

export class Induct<T> {
    protected connection: knex;
    protected idField: keyof T;
    protected idParam: string;
    protected fieldsList: Array<keyof T>;
    protected tableName: string;
    protected validate: boolean;
    protected modifyFunctions: string[];
    protected lookupFunctions: string[];

    protected schema: SchemaConstructor<T>;
    protected _model: ModelConstructor<T>;

    protected modelFactory: ModelFactory<T>;

    constructor(args: InductConstructorOpts<T>) {
        this.connection = args.connection;
        this.schema = args.schema;
        this.idField = args.idField;
        this.tableName = args.tableName;
        this.idParam = args.idParam || "id";

        this.fieldsList = args.fields;

        this.validate = args.validate;
        this._model = args.customModel;

        this.modifyFunctions = [
            "update",
            "create",
            "delete",
            ...(args.additionalModifyFunctions || []),
        ];
        this.lookupFunctions = [
            "findOneById",
            "findAll",
            ...(args.additionalLookupFunctions || []),
        ];

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

    async model(
        data: T,
        opts?: InductModelOpts<T>
    ): Promise<InductModel<T>> | null {
        try {
            const modelOpts = this._copyOpts(opts);

            const model = await this.modelFactory(data, modelOpts);

            return model;
        } catch (e) {
            console.log(e); //eslint-disable-line
            return null;
        }
    }

    handler(
        modelFn: string,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        if (this.lookupFunctions.includes(modelFn)) {
            return this.lookupHandler(modelFn, opts);
        } else {
            return this.modifyHandler(modelFn, opts);
        }
    }

    private lookupHandler(
        modelFn: string,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        if (!this.lookupFunctions.includes(modelFn)) {
            throw new TypeError(
                `${modelFn} is not registered as a lookup method`
            );
        }

        const modelOpts = this._copyOpts(opts);

        return async (req: Request, res: Response): Promise<Response> => {
            let result: IControllerResult<T>;

            const values = {...req.body};

            if (req.params[this.idParam]) {
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

                const fn = model[modelFn];

                const lookup = (await fn()) as Array<T>;

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

    private modifyHandler(
        modelFn: string,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        const modelOpts = this._copyOpts(opts);
        if (!this.modifyFunctions.includes(modelFn)) {
            throw new TypeError(
                `${modelFn} is not registered as a modify method`
            );
        }

        return async (req: Request, res: Response): Promise<Response> => {
            let result: IControllerResult<T>;

            const values = {...req.body};

            if (req.params[this.idParam]) {
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

                const fn = model[modelFn];

                const modified = await fn();

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

    public router(): Router {
        const router = Router(); // eslint-disable-line new-cap

        router.get("/", this.handler("findAll"));

        router.post("/", this.handler("create", {validate: true}));
        router.patch("/:id", this.handler("update", {validate: true}));

        router.get("/:id", this.handler("findOneById"));
        router.delete("/:id", this.handler("delete"));

        return router;
    }
}

export default Induct;
