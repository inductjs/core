import Induct, {InductConstructorOpts} from "./induct";
import {
    FunctionOfModel,
    FunctionOfInductModel,
    InductModelOpts,
    FunctionType,
} from "./types/model-schema";
import {RequestHandler, Request, Response, Router} from "express";
import {
    ControllerResultOpts,
} from "./controller-result";
import {ok, badRequest, noContent, internalError, notFound, created} from "./result-helpers";

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
                `${modelFn} is not registered as a model function. Please use registerModelFunction first.`
            );
        }
    }

    private queryHandler(
        modelFn: string,
        opts?: InductModelOpts<T>
    ): RequestHandler {
        return async (req: Request, res: Response): Promise<Response> => {
            const values = {...req.body};

            if (req.params[this.idParam]) {
                values[this.idField] = req.params[this.idParam];
            }

            try {
                const model = await this.modelFactory(values, opts);

                if (!model) {
                    return badRequest(res, this.resultOpts);
                }

                const fn = model[modelFn];

                if (typeof fn !== "function") {
                    throw new TypeError(`'${modelFn}' is not a function`);
                }

                const lookup = await fn();

                if (!lookup || (Array.isArray(lookup) && lookup.length == 0)) {
                    return notFound(res, this.resultOpts);
                }

                const data = (Array.isArray(lookup) && lookup.length == 1)
                    ? lookup[0]
                    : lookup;

                return ok(res, data, this.resultOpts);
            } catch (e) {
                return internalError(res, e);
            }
        };
    }

    private mutationHandler(
        modelFn: string,
        opts?: InductModelOpts<T>
    ): RequestHandler {
        return async (req: Request, res: Response): Promise<Response> => {
            const values = {...req.body};

            if (req.params[this.idParam]) {
                values[this.idField] = req.params.id;
            }

            try {
                const model = await this.modelFactory(values, opts);

                if (!model) {
                    return badRequest(res, this.resultOpts);
                }

                const fn = model[modelFn];

                if (typeof fn !== "function") {
                    throw new TypeError(`'${modelFn}' is not a function`);
                }

                const modified = await fn();

                if (!modified) {
                    if (modelFn === "create") {
                        return badRequest(res, this.resultOpts);
                    }

                    return notFound(res, this.resultOpts);
                }

                if (modelFn === "create") {
                    return created(res, modified, this.resultOpts);
                } else if (modelFn === "delete") {
                    return noContent(res, this.resultOpts);
                }

                return ok(res, modified, this.resultOpts);
            } catch (e) {
                return internalError(res, e, this.resultOpts);
            }
        };
    }
}
