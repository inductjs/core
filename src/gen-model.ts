import {InductModelOpts, IModel, InductModelFactory} from "./types/model-schema";

/**
 * Creates a factory function which returns a promise that resolves to an instance of the supplied model class.
 * The returned function is used as an input for Induct's controller factories.
 *
 * @param valProps array of property names that can be used by the model to lookup data (ex. user_id)
 * @param Model Model class that extends Induct's IModel interface
 * @example
 * const modelFactory = createModelFactory(['user_id', 'username'], UserModel)
 */
export const createModelFactory = <T, M extends IModel<T>>(
    valProps: Array<string>,
    Model: new (params: T, opts: InductModelOpts) => M
): InductModelFactory<T, M> => {
    const modelFactory = async (
        factoryParams: T,
        opts?: InductModelOpts
    ): Promise<M> => {
        try {
            // Check if a possible lookup value is present
            const lookupVal = factoryParams
                ? valProps.filter((prop) => !!factoryParams[prop])
                : [];

            // Throw if no possible lookup field is supplied
            if (valProps && lookupVal.length === 0 && !opts?.all) {
                throw new TypeError("Lookup field or bulk option unspecified");
            }

            // Create and return model
            const model = new Model(factoryParams, opts);

            return model;
        } catch (e) {
            return null;
        }
    };
    return modelFactory;
};
