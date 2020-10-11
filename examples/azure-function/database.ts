import knex from "knex";

const openConnection = (): knex => {
  return knex({
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    // debug: true,
  });
};

const con = openConnection();

export default con;
