import {
	NextFunction, Response, Request, Handler,
} from '../types/express';
import { BindingConfig } from '../types/request-context';
import { wrapAsync } from '../helpers/wrap-async';

function renameModelProperties(
	data: Record<string, any>,
	mapping: Record<string, any>
): Record<string, any> {
	const cp = { ...data };

	for (const [oldName, newName] of Object.entries(mapping)) {
		const val = cp[oldName];
		cp[newName] = val;

		delete cp[oldName];
	}

	return cp;
}

/**
 * Returns middleware that compiles values from several locations in the request object into req.model.
 * Optionally takes a configuration object to rename data parameters.
 * The result of this middleware serves as input for model validation and binding.
 *
 * Example config:
 * ```typescript
 * const conf: ContextExtractionConf = {
 * 	user: 'user_uuid',
 * 	params: ['subscription_uuid']
 * };
 * ```
 */
export function consolidateRequestData<T>(conf?: BindingConfig<T>): Handler {
	return wrapAsync(
		async (
			req: Request,
			_res: Response,
			next: NextFunction
		): Promise<any> => {
			let modelData = {};

			if (conf?.user) {
				modelData = {
					...modelData,
					...renameModelProperties(req.context.user, conf.user),
				};
			}

			if (conf?.params) {
				modelData = {
					...modelData,
					...renameModelProperties(req.params, conf.params),
				};
			}

			if (conf?.query) {
				modelData = {
					...modelData,
					...renameModelProperties(req.query, conf.params),
				};
			}

			// Map entire body
			Object.assign(modelData, req.body);

			req.model = modelData;

			next();
		}
	);
}
