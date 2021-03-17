import { MongoStrategy } from './strategies/mongo-strategy';
import { SqlStrategy } from './strategies/sql-strategy';
import { Constructor } from './types/constructors';
import { InductOptions } from './types/induct';
import { Controller } from './induct-controller';
import { Strategy } from './strategies/abstract-strategy';

/** Instantiates an Induct Controller using the given strategy */
export const createController = <T>(
	path: string,
	strategy: Constructor<Strategy<T>>,
	opts: InductOptions<T>): Controller<T> => {
	if (strategy === MongoStrategy && !opts.idField) {
		opts.idField = '_id';
	}

	else if (strategy === SqlStrategy && !opts.tableName) {
		throw new TypeError('[error] tableName property missing while using Sql Strategy');
	}

	return new Controller(path, strategy, opts);
};
