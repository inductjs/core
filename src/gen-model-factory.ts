import {InductModelOpts, InductModelFactory} from "./types/model-schema";
import {InductModel} from "./gen-model";
import {ValidationError} from "./types/error-schema";

/**
 * Creates a factory function which returns a promise that resolves to an instance of the supplied model class.
 * The returned function is used as an input for Induct's controller factories.
 *
 * @param valProps array of property names that can be used by the model to lookup data (ex. user_id).
 * Used to check if a valid lookup field is supplied.
 * @type Takes a type parameter of a schema class.
 * @example
 * const modelFactory = createModelFactory(['user_id', 'username'])
 */
export const createModelFactory = <T>(
    valProps: Array<keyof T>
): InductModelFactory<T> => {
    const modelFactory = async (
        values: T,
        opts: InductModelOpts<T>
    ): Promise<InductModel<T>> => {
        const {all, validate} = opts;

        // Check if a possible lookup value is present
        const lookupVal = values
            ? valProps.filter((prop) => !!values[prop])
            : [];

        // Throw if no possible lookup field is supplied
        if (valProps && lookupVal.length === 0 && !all) {
            throw new TypeError("Lookup field or bulk option unspecified");
        }

        // Create and return model
        const model = new InductModel<T>(values, opts);

        if (validate) {
            const errors = await model.validate();
            if (errors.length > 0) {
                throw new ValidationError(`Schema validation failed`);
            }
        }

        return model;
    };
    return modelFactory;
};
