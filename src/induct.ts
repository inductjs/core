import {
    InductModelOpts,
    InductModelFactory,
    LookupModelFunction,
    ModifierModelFunction,
} from "./types/model-schema";
import {IControllerResult, ControllerResult} from "./controller-result";
import {createModelFactory} from "./gen-model-factory";
import {StatusCode} from "./types/http-schema";
import {RequestHandler, Request, Response, Router, NextFunction} from "express";
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
    /** [NOT IMPLEMENTED] Array of field names that can be used as a lookup field */
    additionalLookupFields?: Array<keyof T>;
    /** url parameter for resource ID's. Default = "id" */
    idParam?: string;
    /** Set to true for bulk operations accross the whole table, skipping individual validation  */
    all?: boolean;
    /** Set to true to validate input data on instantiation */
    validate?: boolean; // Validation in MOD CONTROLLER instead of MODEL????
    /** Array of field names that are returned in lookup controllers */
    fieldsList?: Array<keyof T>;
}

export class Induct<T> {
    private connection: knex;
    private schema: new (val: T) => T;
    private idField: keyof T;
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
        this.lookupFields = [args.idField, ...args.additionalLookupFields];
        this.fieldsList = args.fieldsList;

        this.validate = args.validate;
        this.all = args.all;

        this.modelFactory = createModelFactory<T>(this.lookupFields);
    }

    private _getModelOptions(): InductModelOpts<T> {
        const {
            all,
            validate,
            fieldsList,
            schema,
            connection,
            tableName,
            idField,
        } = this;

        return {
            all,
            validate,
            fields: fieldsList,
            schema,
            connection,
            tableName,
            idField,
        };
    }

    lookupHandler(modelFn: LookupModelFunction): RequestHandler {
        const modelOpts = this._getModelOptions();

        return async (
            req: Request,
            res: Response,
            next?: NextFunction
        ): Promise<Response> => {
            let result: IControllerResult<T>;

            try {
                const model = await this.modelFactory(req.body, modelOpts);

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

                const lookup = await model[modelFn]();

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

    modifyHandler(modelFn: ModifierModelFunction): RequestHandler {
        const modelOpts = this._getModelOptions();

        return async (
            req: Request,
            res: Response,
            next?: NextFunction
        ): Promise<Response> => {
            let result: IControllerResult<T>;

            try {
                const model = await this.modelFactory(req.body, modelOpts);

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

    public router(): Router {
        const router = Router(); // eslint-disable-line new-cap

        this.all = true;
        router.get("/", this.lookupHandler("findAll"));
        this.all = false;

        this.validate = true;
        router.post("/", this.modifyHandler("create"));
        router.patch("/:id", this.modifyHandler("update"));
        this.validate = false;

        router.get("/:id", this.lookupHandler("findOneById"));
        router.delete("/:id", this.modifyHandler("delete"));

        return router;
    }
}
