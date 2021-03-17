import knex from 'knex';
import { PErrorEither } from './types/utils';
import { InductService } from './types/induct';

export interface Model<T> {
	query: Partial<T>;
	data: Partial<T>;
}

export function DefaultSqlService<T>(con: knex, table: string): InductService<T> {
	return {
	    async create(model: Model<T>): PErrorEither<T> {
			let err = null,
				res = null;

			con(table)
				.insert(model.data)
				.returning('*')
				.then(r => res = r)
				.catch(e => err = e);

			return [res, err];
		},

		async find(model: Model<T>): PErrorEither<T[]> {
			let err = null,
				res = null;

			con(table)
				.where(model.query)
				.then(r => res = r)
				.catch(e => err = e);

			return [res, err];
		},

		async findAll(): PErrorEither<T[]> {
			let err = null,
				res = null;

			con(table)
				.then(r => res = r)
				.catch(e => err = e);

			return [res, err];
		},

		async del(model: Model<T>): PErrorEither<T> {
			let err = null,
				res = null;

			con(table)
				.where(model.query)
				.del()
				.then(r => res = r)
				.catch(e => err = e);

			return [res, err];
		},

		async update(model: Model<T>): PErrorEither<T> {
			let err = null,
				res = null;

			con(table)
				.where(model.query)
				.update(model.data)
				.returning('*')
				.then(r => res = r)
				.catch(e => err = e);

			return [res, err];
		},
	};
}
