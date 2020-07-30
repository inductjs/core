import {ModelOptions, IModel, ModelFactory} from "./types/model-schema";

export const createModelFactory = <T, M extends IModel<T>>(
    valProps: Array<string>,
    ModelGeneric: new (params: T, opts: ModelOptions) => M
): ModelFactory<T, M> => {
    const modelFactory = async (
        factoryParams: T,
        opts?: ModelOptions
    ): Promise<M> => {
        try {
            const lookupVal = factoryParams
                ? valProps.filter((prop) => !!factoryParams[prop])
                : [];

            if (valProps && lookupVal.length === 0 && !opts?.all) {
                throw new TypeError("Lookup field or bulk option unspecified");
            }

            const model = new ModelGeneric(factoryParams, opts);

            return model;
        } catch (e) {
            return null;
        }
    };
    return modelFactory;
};
