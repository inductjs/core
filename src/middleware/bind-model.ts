import {
	NextFunction, Response, Request, Handler,
} from '../types/express';
import { BindingConfig, BindingConfigEntry } from '../types/request-context';
import { wrapAsync } from '../helpers/wrap-async';


/**
 * Gets the value from a context extraction config entry.
 *
 * If the entry is a single string, this will be used as the property name.
 * If the entry is an object, the key will be used to lookup the property, and mapped to a property with the value as its name
 *
 * Example:
 * ```typescript
 *
 * getValue(obj, 'property') => { property: obj[property] }
 * getValue
 * getValue(obj, { property: 'name' }) => { name: obj[property] }
 * ```
*/
function getValue(ctx, prop): any {
	if (typeof prop === 'string') {
		return { [prop]: ctx[prop] };
	}

	if (Array.isArray(prop)) {
		return prop.map(p => ({ [p]: ctx[p] }));
	}

	const result = {};

	const entries = Object.entries(prop);

	for (const [key, value] of entries) {
		Object.assign(result, { [value as string]: ctx[key] });
	}

	return result;
}

/**
 * Extracts the values of a single location
 */
function extractContext<T>(
	ctx: any,
	conf: BindingConfigEntry<T>
): Partial<T> {
	if (!Array.isArray(conf)) {
		return getValue(ctx, conf);
	}
	else {
		const vals = {};

		conf.forEach(val => {
			Object.assign(vals, getValue(ctx, val));
		});

		return vals;
	}
}

/**
 * Returns middleware that compiles values from several locations in the request object into req.model.
 * The result of this middleware function is used by the initModel middleware to instantiate models.
 *
 * Example config:
 * ```typescript
 * const conf: ContextExtractionConf = {
 * 	user: 'user_uuid',
 * 	platform: [{
 * 		id: 'dataplatform_uuid',
 * 		dpName: 'name',
 * 	}],
 * 	params: ['subscription_uuid']
 * };
 * ```
 */
export function bindModel<T>(conf?: BindingConfig<T>): Handler {
	return wrapAsync(async (
		req: Request,
		_res: Response,
		next: NextFunction
	): Promise<any> => {
		let modelData = {};

		if (conf?.user) {
			modelData = {
				...modelData,
				...extractContext<T>(req.context.user, conf.user),
			};
		}

		if (conf?.params) {
			Object.assign(
				modelData,
				extractContext(req.params, conf.params)
			);
		}

		if (conf?.query) {
			Object.assign(
				modelData,
				extractContext(req.query, conf.query)
			);
		}

		// Map entire body
		Object.assign(
			modelData,
			req.body
		);

		next();
	});
}
