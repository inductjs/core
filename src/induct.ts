import {
    InductModelOpts,
    InductModelFactory,
    GenericModelFactory,
    HandlerFunction,
    IModel,
} from "./types/model-schema";
import {InductModel} from "./gen-model";
import {IControllerResult, ControllerResult} from "./controller-result";
import {inductModelFactory} from "./gen-model-factory";
import {StatusCode} from "./types/http-schema";
import {RequestHandler, Request, Response, Router} from "express";
import {AzureFunction, Context, HttpRequest} from "@azure/functions";
import {HttpResponse, HttpMethod} from "azure-functions-ts-essentials";
import {InductControllerOpts} from "./types/controller-schema";
import knex from "knex";

export interface InductConstructorOpts<T> {
    /** KnexJS database connection object */
    connection: knex;
    /** Schema class for typesafety and validation */
    schema: new (val: T) => T;
    /** Name of ID field to use for lookups */
    idField: keyof T;
    /** Name of the table to query */
    tableName: string;
    /** url parameter for resource ID's. Default = "id" */
    idParam?: string;
    /** Set to true for bulk operations accross the whole table, skipping individual validation  */
    all?: boolean;
    /** Set to true to validate input data on instantiation */
    validate?: boolean; // Validation in MOD CONTROLLER instead of MODEL????
    /** Array of field names that are returned in lookup controllers */
    fieldsList?: Array<keyof T>;
    /** [NOT IMPLEMENTED] Array of field names that can be used as a lookup field */
    additionalLookupFields?: Array<keyof T>;
    /** [NOT IMPLEMENTED]  Custom model factory function */
    modelFactory?: InductModelFactory<T> | GenericModelFactory<T>;
}

export class Induct<T> {
    private connection: knex;
    private schema: new (val: T) => T;
    private idField: keyof T;
    private idParam: string;
    private fieldsList: Array<keyof T>;
    private tableName: string;

    private all: boolean;
    private validate: boolean;

    private modelFactory: InductModelFactory<T>;
    private lookupFields: Array<keyof T>;

    constructor(args: InductConstructorOpts<T>) {
        this.connection = args.connection;
        this.schema = args.schema;
        this.idField = args.idField;
        this.tableName = args.tableName;
        this.idParam = args.idParam || "id";

        this.lookupFields = [
            args.idField,
            ...(args.additionalLookupFields ?? []),
        ];
        this.fieldsList = args.fieldsList;

        this.validate = args.validate;
        this.all = args.all;

        this.modelFactory = inductModelFactory<T>(this.lookupFields);
    }

    private _getModelOptions(
        overrides: Partial<InductModelOpts<T>> = {}
    ): InductModelOpts<T> {
        const overrideEntries = Object.entries(overrides);

        const {
            all,
            validate,
            fieldsList,
            schema,
            connection,
            tableName,
            idField,
        } = this;

        const opts = {
            all,
            validate,
            fields: fieldsList,
            schema,
            connection,
            tableName,
            idField,
        };

        for (const [key, value] of overrideEntries) {
            opts[key] = value;
        }

        return opts;
    }

    async model(data: T, opts?: InductModelOpts<T>): Promise<InductModel<T>> {
        const modelOpts = this._getModelOptions(opts);
        const factory = inductModelFactory([this.idField]);

        const model = await factory(data, modelOpts);

        return model;
    }

    handler(
        modelFn: HandlerFunction,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        if (modelFn.indexOf("find") !== -1) {
            return this.lookupHandler(modelFn, opts);
        } else {
            return this.modifyHandler(modelFn, opts);
        }
    }

    private lookupHandler(
        modelFn: HandlerFunction,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        const modelOpts = this._getModelOptions(opts);

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

                if (typeof model[modelFn] !== "function") {
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

    private modifyHandler(
        modelFn: HandlerFunction,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        const modelOpts = this._getModelOptions(opts);

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

                if (typeof model[modelFn] !== "function") {
                    throw new TypeError(
                        `${modelFn} is not a function of the supplied model`
                    );
                }

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
        opts: Partial<InductModelOpts<T>>
    ): AzureFunction {
        const modelOpts = this._getModelOptions(opts);

        return async (
            context: Context,
            req: HttpRequest
        ): Promise<HttpResponse> => {
            const id = req.params ? req.params.id : undefined;
            const values = {...req.body};

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

        router.get("/", this.lookupHandler("findAll", {all: true}));

        router.post("/", this.modifyHandler("create", {validate: true}));
        router.patch("/:id", this.modifyHandler("update", {validate: true}));

        router.get("/:id", this.lookupHandler("findOneById"));
        router.delete("/:id", this.modifyHandler("delete"));

        return router;
    }
}
