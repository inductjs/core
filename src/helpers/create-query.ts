import knex from 'knex';
import { Query } from 'mongoose';
import { ModelAction } from '../types';
import { PErrorEither } from '../types/utils';

export enum QueryType {
    FIND_ALL,
    FIND,
    CREATE,
    UPDATE,
    DELETE,
    CUSTOM,
}

export type InductQuery<T> = {
    run(con: knex, data?: Partial<T>): PErrorEither<T[]>;
};

function buildFilter(
	fieldList: string | string[],
	data: Record<string, any>
): Record<string, any> {
	const filter = {};

	if (Array.isArray(fieldList)) {
		fieldList.forEach(f => {
			filter[f] = data[f];
		});
	}
	else {
		filter[fieldList] = data[fieldList];
	}

	return filter;
}

export function buildFindAllQuery<T = {}>(
	table: string,
	returnFields?: (keyof T)[]
) {
	return function(con: knex): knex.QueryBuilder {
		const q = con(table).select(returnFields);

		return q;
	};
}

export function buildFindQuery<T = {}>(
	table: string,
	filterFields: (keyof T)[],
	returnFields?: (keyof T)[]
) {
	return function(con: knex, data: Partial<T>): knex.QueryBuilder {
		const filter = buildFilter(filterFields as string[], data);

		const q = con(table)
			.where(filter)
			.returning((returnFields as string[]) ?? '*');

		return q;
	};
}

export function buildCreateQuery<T = {}>(
	table: string,
	returnFields?: (keyof T)[]
) {
	return function(con: knex, data: Partial<T>): knex.QueryBuilder {
		const q = con(table)
			.insert(data)
			.returning((returnFields as string[]) ?? '*');

		return q;
	};
}

export function buildUpdateQuery<T = {}>(
	table: string,
	filterFields: (keyof T)[],
	returnFields?: (keyof T)[]
) {
	return function(con: knex, data: Partial<T>): knex.QueryBuilder {
		const filter = buildFilter(filterFields as string[], data);

		const q = con(table)
			.update(data)
			.where(filter)
			.returning((returnFields as string[]) ?? '*');

		return q;
	};
}

export function buildDeleteQuery<T>(
	table: string,
	filterFields: (keyof T)[],
	returnFields?: (keyof T)[]
) {
	return function(con: knex, data: Partial<T>): knex.QueryBuilder {
		const filter = buildFilter(filterFields as string[], data);

		const q = con(table)
			.update(data)
			.where(filter)
			.returning((returnFields as string[]) ?? '*');

		return q;
	};
}

export function createQuery<T>(
	type: QueryType,
	table: string,
	filterFields?: (keyof T)[],
	returnFields?: (keyof T)[]
): InductQuery<T> {
	let q: ModelAction<T>;

	switch (type) {
		case QueryType.FIND_ALL:
			q = buildFindAllQuery(table, returnFields);
			break;
		case QueryType.FIND:
			q = buildFindQuery(table, filterFields, returnFields);
			break;
		case QueryType.CREATE:
			q = buildCreateQuery(table, returnFields);
			break;
		case QueryType.UPDATE:
			q = buildUpdateQuery(table, returnFields);
			break;
		case QueryType.DELETE:
			q = buildDeleteQuery(table, filterFields, returnFields);
			break;
	}

	return {
		async run(con: knex, data?: Partial<T>): PErrorEither<T[]> {
			let err = null,
				res = null;

			await q(con, data)
				.then(r => (res = r))
				.catch(e => (err = e));

			return [res, err];
		},
	};
}
