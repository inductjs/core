import {AzureFunction, Context, HttpRequest} from "@azure/functions";
import {HttpResponse, HttpMethod} from "azure-functions-ts-essentials";
import {InductModelOpts, IModel} from "./types/model-schema";
import {InductControllerOpts} from "./types/controller-schema";

export const createAzureFunctionsRouter = <T, M extends IModel<T>>(
    opts: InductControllerOpts<T, M>
): AzureFunction => {
    const {modelFactory} = opts;

    return async (
        context: Context,
        req: HttpRequest,
        opts?: InductModelOpts<T>
    ): Promise<HttpResponse> => {
        const id = req.params ? req.params.id : undefined;

        let result: T | T[] | number | string;
        let res: HttpResponse;

        try {
            const Model = await modelFactory({...req.body, opts});

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
                        result = await Model.delete();
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
};
