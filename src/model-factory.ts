import {InductModelOpts} from "./types/model-schema";
import {InductModel} from "./base-model";
import {ValidationError} from "./types/error-schema";

/**
 * Returns a promise that resolves to an instance of an InductModel (or extention therof).
 */
export const inductModelFactory = async <
    T,
    R extends InductModel<T> | InductModel<T>
>(
    values: T,
    opts: InductModelOpts<T>,
    ...args: any[]
): Promise<R | InductModel<T>> => {
    const {validate} = opts;

    // Create model
    const modelInstance: R | InductModel<T> = opts.customModel
        ? new opts.customModel(values, opts, args) // eslint-disable-line new-cap
        : new InductModel(values, opts);

    // Validate incoming data
    if (validate) {
        const errors = await modelInstance.validate();
        if (errors.length > 0) {
            throw new ValidationError(`Schema validation failed`);
        }
    }

    return modelInstance;
};
