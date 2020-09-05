import Induct from "./induct";
import {AzureFunction, Context, HttpRequest} from "@azure/functions";
import {HttpResponse, HttpMethod} from "azure-functions-ts-essentials";
import {InductModelOpts} from "./types/model-schema";

export class InductAzure<T> extends Induct<T> {
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
}
