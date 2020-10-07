import {
    InductModelOpts,
    ModelFactory,
    SchemaConstructor,
    ModelConstructor,
    FunctionOfInductModel,
} from "../../types/model-schema";
import {InductModel} from "../../base-model";
import {RequestHandler, Router} from "express";
import {AzureFunction} from "@azure/functions";
import knex from "knex";

export interface TestInduct<T> {
    connection: knex;
    idField: keyof T;
    idParam: string;
    fieldsList: Array<keyof T>;
    tableName: string;
    validate: boolean;

    schema: SchemaConstructor<T>;
    _model: ModelConstructor<T>;

    modelFactory: ModelFactory<T>;

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
    azureFunctionsRouter(opts?: Partial<InductModelOpts<T>>): AzureFunction;
    router: () => Router;
}
