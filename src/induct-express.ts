import Induct, {InductConstructorOpts} from "./induct";
import {
    FunctionOfModel,
    FunctionOfInductModel,
    InductModelOpts,
    FunctionType,
} from "./types/model-schema";
import {RequestHandler, Request, Response, Router} from "express";
import {
    IControllerResult,
    ControllerResult,
    ControllerResultOpts,
} from "./controller-result";
import {HttpStatusCode} from "azure-functions-ts-essentials";

export interface ExpressConstructorOpts<T> extends InductConstructorOpts<T> {
    /** Additional method names to support for creating POST,PATCH,DELETE handlers */
    mutations?: string[];
    /** Additional method names to support for creating GET handlers */
    queries?: string[];
    /** Options to determine the output of the controller result and format of the response body */
    resultOpts?: ControllerResultOpts;
}

export class InductExpress<T> extends Induct<T> {
    private mutations: string[];
    private queries: string[];
    private resultOpts: ControllerResultOpts;

    constructor(args: ExpressConstructorOpts<T>) {
        super(args);
        this.mutations = [
            "update",
            "create",
            "delete",
            ...(args.mutations || []),
        ];
        this.queries = ["findOneById", "findAll", ...(args.queries || [])];

        this.resultOpts = args.resultOpts;
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

    registerModelFunction<M>(
        type: FunctionType,
        functionName: FunctionOfModel<M>
    ): void {
        if (type === FunctionType.Query) {
            this.queries.push(functionName as string);
        } else if (type === FunctionType.Mutation) {
            this.mutations.push(functionName as string);
        }
    }

    handler<M>(
        modelFn: FunctionOfInductModel<T> | FunctionOfModel<M>,
        opts?: Partial<InductModelOpts<T>>
    ): RequestHandler {
        const modelOpts = this._copyOpts(opts);

        if (this.queries.includes(modelFn as string)) {
            return this.queryHandler(modelFn as string, modelOpts);
        } else if (this.mutations.includes(modelFn as string)) {
            return this.mutationHandler(modelFn as string, modelOpts);
        } else {
            throw new TypeError(
                `${modelFn} is not registered as a handler method`
            );
        }
    }

    private queryHandler(
        modelFn: string,
        opts?: InductModelOpts<T>
    ): RequestHandler {
        return async (req: Request, res: Response): Promise<Response> => {
            let result: IControllerResult<T>;

            const values = {...req.body};

            if (req.params[this.idParam]) {
                values[this.idField] = req.params[this.idParam];
            }

            try {
                const model = await this.modelFactory(values, opts);

                if (!model) {
                    return new ControllerResult(
                        {
                            res,
                            status: HttpStatusCode.BadRequest,
                        },
                        this.resultOpts
                    ).send();
                }

                const fn = model[modelFn];

                const lookup = await fn();

                if (!lookup || (Array.isArray(lookup) && lookup.length == 0)) {
                    result = {
                        res,
                        status: HttpStatusCode.NotFound,
                    };
                } else {
                    let data;

                    if (Array.isArray(lookup) && lookup.length == 1) {
                        data = lookup[0];
                    } else data = lookup;

                    result = {
                        res,
                        status: HttpStatusCode.OK,
                        data,
                    };
                }
            } catch (e) {
                result = {
                    res,
                    status: HttpStatusCode.InternalServerError,
                    error: e,
                };
            }

            const controllerResult = new ControllerResult(
                result,
                this.resultOpts
            );

            return controllerResult.send();
        };
    }

    private mutationHandler(
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
                    return new ControllerResult(
                        {
                            res,
                            status: HttpStatusCode.BadRequest,
                        },
                        this.resultOpts
                    ).send();
                }

                const fn = model[modelFn];

                const modified = await fn();

                if (!modified) {
                    const failStatus =
                        modelFn === "create"
                            ? HttpStatusCode.BadRequest
                            : HttpStatusCode.NotFound;

                    result = {
                        res,
                        status: failStatus,
                    };
                } else {
                    let sucStatus: HttpStatusCode = HttpStatusCode.OK;

                    if (modelFn === "create") {
                        sucStatus = HttpStatusCode.Created;
                    } else if (modelFn === "delete") {
                        sucStatus = HttpStatusCode.NoContent;
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
                    status: HttpStatusCode.InternalServerError,
                    error: e,
                };
            }

            return new ControllerResult(result, this.resultOpts).send();
        };
    }
}
