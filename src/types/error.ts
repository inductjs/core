import { errMsg, error } from '../helpers/logging';
import { red } from 'chalk';

export class ContextError extends Error {
	constructor(msg: string) {
		super(msg);

		this.name = 'ContextError';

		this.message = errMsg + `missing required context`;
	}
}

export class ValidationError extends Error {
	constructor(msg: string) {
		super();
		this.message = msg;

		this.name = 'ValidationError';
	}
}

export class QueryError extends Error {
	constructor(msg: string) {
		super(msg);

		this.name = undefined;
		this.message = msg;
	}
}

export class CommandError extends Error {
	constructor(msg: string) {
		super(msg);

		this.name = 'CommandError';

		this.message = msg;
	}
}
