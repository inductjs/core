import {
    FunctionOfInductModel,
    ModelFactory,
    Constructor,
} from "../../types/model-schema";
import {InductModelOpts, InductModel} from "../../types/induct";
import {RequestHandler, Router} from "express";
import {AzureFunction} from "@azure/functions";
import knex from "knex";

export interface TestInduct<T> {
    _connection: knex;
    _idField: keyof T;
    _idParam: string;
    _fieldsList: Array<keyof T>;
    _tableName: string;
    _validate: boolean;

    _schema: Constructor<T>;
    _model: Constructor<T>;

    _modelFactory: ModelFactory<T>;

    _copyOpts: (overrides: Partial<InductModelOpts<T>>) => InductModelOpts<T>;
    model: (data: T, opts?: InductModelOpts<T>) => Promise<InductModel<T>>;
    mutation: (
        modelFn: FunctionOfInductModel<T>,
        opts?: Partial<InductModelOpts<T>>
    ) => RequestHandler;
    query: (
        modelFn: FunctionOfInductModel<T>,
        opts?: Partial<InductModelOpts<T>>
    ) => RequestHandler;
    _createQueryHandler: (
        modelFn: string,
        opts?: Partial<InductModelOpts<T>>
    ) => RequestHandler;
    _createMutationHandler: (
        modelFn: string,
        opts?: Partial<InductModelOpts<T>>
    ) => RequestHandler;
    azureHttpTrigger(opts?: Partial<InductModelOpts<T>>): AzureFunction;
    router: () => Router;
    _valuesFromRequest(request: Request): T;
}
