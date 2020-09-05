import {
    InductModelOpts,
    ModelFactory,
    SchemaConstructor,
    ModelConstructor,
} from "./types/model-schema";
import {InductModel} from "./base-model";
import {modelFactory} from "./model-factory";
import knex from "knex";

export interface InductConstructorOpts<T> extends InductModelOpts<T> {
    /** url parameter for resource ID's. Default = "id" */
    idParam?: string;
}

export class Induct<T> {
    protected connection: knex;
    protected idField: keyof T;
    protected idParam: string;
    protected fieldsList: Array<keyof T>;
    protected tableName: string;
    protected validate: boolean;

    protected schema: SchemaConstructor<T>;
    protected _model: ModelConstructor<T>;

    protected modelFactory: ModelFactory<T>;

    constructor(args: InductConstructorOpts<T>) {
        this.connection = args.connection;
        this.schema = args.schema;
        this.idField = args.idField;
        this.tableName = args.tableName;
        this.idParam = args.idParam || "id";

        this.fieldsList = args.fields;

        this.validate = args.validate;
        this._model = args.customModel;

        this.modelFactory = modelFactory;
    }

    protected _copyOpts(
        overrides: Partial<InductModelOpts<T>> = {}
    ): InductModelOpts<T> {
        const overrideEntries = Object.entries(overrides);

        // Get existing options in the instance
        const {
            validate,
            fieldsList,
            schema,
            connection,
            tableName,
            idField,
            _model,
        } = this;

        const opts = {
            validate,
            fields: fieldsList,
            schema,
            connection,
            tableName,
            idField,
            customModel: _model,
        };

        // Override options
        for (const [key, value] of overrideEntries) {
            opts[key] = value;
        }

        return opts;
    }

    async model(
        data: T,
        opts?: InductModelOpts<T>
    ): Promise<InductModel<T>> | null {
        try {
            const modelOpts = this._copyOpts(opts);

            const model = await this.modelFactory(data, modelOpts);

            return model;
        } catch (e) {
            console.log(e); //eslint-disable-line
            return null;
        }
    }
}

export default Induct;
