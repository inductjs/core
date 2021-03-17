import knex from 'knex';

// Connects to an AdventureWorks sample database

export const openConnection = (): knex => {
	return knex({
		client: process.env.DB_CLIENT,
		connection: {
			host: process.env.DB_HOST,
			user: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
		},
		// debug: true,
	});
};
