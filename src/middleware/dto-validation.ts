import { ValidationError, Validator } from 'class-validator';
import {
	Request, Response, NextFunction, Handler,
} from '../types/express';
import { isNonEmptyArray } from '../helpers';
import { badRequest } from '../helpers/result';

export type DTOConstructor<T> = new (data: Partial<T>) => Validator;
interface IModelBinder<T> {
    validate(): Promise<ValidationError[]>;
    extractModelBinding(): Partial<T>;
}

function ModelBinder<T>(
	dto: Validator,
	data: Partial<T>
): IModelBinder<T> {
	return {
		validate(): Promise<ValidationError[]> {
			return dto.validate(data);
		},

		extractModelBinding(): Partial<T> {
			const keys = [data, dto]
				.map(o => Object.keys(o))
				.sort((a, b) => a.length - b.length)
				.reduce((a, b) => a.filter(key => b.includes(key)));

			const model = {};

			keys.forEach(key => (model[key] = data[key]));

			return model;
		},
	};
}

export default function bindModel<T = {}>(dtoc: DTOConstructor<T>): Handler {
	return async function(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<Response> {
		const dto = new dtoc(req.body);
		const val = ModelBinder(dto, req.body);

		const errors = await val.validate();

		if (isNonEmptyArray(errors)) {
			return badRequest(res);
		}

		req.model = Object.freeze(val.extractModelBinding());

		next();
	};
}

export {
	bindModel, Validator, ValidationError,
};
