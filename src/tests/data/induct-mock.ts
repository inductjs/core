import {
	FunctionOfInductModel,
	ModelFactory,
} from '../../types/model-schema';
import { Constructor } from '../../types/constructors';
import { InductOptions } from '../../types/induct';
import { RequestHandler, Router } from 'express';
import { AzureFunction } from '@azure/functions';
import knex from 'knex';

export interface TestInduct<T> {
    _connection: knex;
    _idField: keyof T;
    _idParam: string;
    _fieldsList: Array<keyof T>;
    _tableName: string;
    _validate: boolean;

    _schema: Constructor<T>;
    _model: Constructor<T>;

    _initStrategy: ModelFactory<T>;

    _copyOpts: (overrides: Partial<InductOptions<T>>) => InductOptions<T>;
    model: (data: T, opts?: InductOptions<T>) => Promise<InductOptions<T>>;
    mutation: (
        modelFn: FunctionOfInductModel<T>,
        opts?: Partial<InductOptions<T>>
    ) => RequestHandler;
    query: (
        modelFn: FunctionOfInductModel<T>,
        opts?: Partial<InductOptions<T>>
    ) => RequestHandler;
    _createQueryHandler: (
        modelFn: string,
        opts?: Partial<InductOptions<T>>
    ) => RequestHandler;
    _createMutationHandler: (
        modelFn: string,
        opts?: Partial<InductOptions<T>>
    ) => RequestHandler;
    azureHttpTrigger(opts?: Partial<InductOptions<T>>): AzureFunction;
    defaultRouter: () => Router;
    _valuesFromRequest(request: Request): T;
}
