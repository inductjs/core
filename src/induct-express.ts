import Induct, {InductConstructorOpts} from "./induct";
import {FunctionOfModel, InductModelOpts} from "./types/model-schema";
import {StatusCode} from "./types/http-schema";
import {RequestHandler, Request, Response, Router} from "express";
import {IControllerResult, ControllerResult} from "./controller-result";

export interface InductExpressConstructorOpts<T>
    extends InductConstructorOpts<T> {
    /** Additional method names to support for creating POST,PATCH,DELETE handlers */
    additionalModifyFunctions?: string[];
    /** Additional method names to support for creating GET handlers */
    additionalLookupFunctions?: string[];
}

export class InductExpress<T> extends Induct<T> {
    protected modifyFunctions: string[];
    protected lookupFunctions: string[];

    constructor(args: InductExpressConstructorOpts<T>) {
        super(args);
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

    registerModelFunction<T>(
        type: "lookup" | "modify",
        functionName: FunctionOfModel<T>
    ): void {
        if (type === "lookup") {
            this.lookupFunctions.push(functionName as string);
        } else if (type === "modify") {
            this.modifyFunctions.push(functionName as string);
        }
    }

    handler(
        modelFn: string,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        const modelOpts = this._copyOpts(opts);

        if (this.lookupFunctions.includes(modelFn)) {
            return this.lookupHandler(modelFn, modelOpts);
        } else if (this.modifyFunctions.includes(modelFn)) {
            return this.modifyHandler(modelFn, modelOpts);
        } else {
            throw new TypeError(
                `${modelFn} is not registered as a handler method`
            );
        }
    }

    private lookupHandler(
        modelFn: string,
        opts?: InductModelOpts<T>
    ): RequestHandler {
        return async (req: Request, res: Response): Promise<Response> => {
            let result: IControllerResult<T>;

            const values = {...req.body};

            if (req.params[this.idParam]) {
                values[this.idField] = req.params.id;
            }

            try {
                const model = await this.modelFactory(values, opts);

                if (!model) {
                    return new ControllerResult({
                        res,
                        status: StatusCode.BAD_REQUEST,
                    }).send();
                }

                const fn = model[modelFn];

                const lookup = await fn();

                if (!lookup || (Array.isArray(lookup) && lookup.length == 0)) {
                    result = {
                        res,
                        status: StatusCode.NOT_FOUND,
                    };
                } else {
                    let data;

                    if (Array.isArray(lookup) && lookup.length == 1) {
                        data = lookup[0];
                    } else data = lookup;

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
        opts?: InductModelOpts<T>
    ): RequestHandler {
        return async (req: Request, res: Response): Promise<Response> => {
            let result: IControllerResult<T>;

            const values = {...req.body};

            if (req.params[this.idParam]) {
                values[this.idField] = req.params.id;
            }

            try {
                const model = await this.modelFactory(values, opts);

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
}
