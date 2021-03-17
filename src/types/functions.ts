import { ErrorEither, PErrorEither } from './utils';
import { Model } from '../sql-service';

export type ModelAction<T> = (
	model: Model<T>
) => PErrorEither<T | T[]> | ErrorEither<T | T[]>;
