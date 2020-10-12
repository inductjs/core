import {induct, InductApp} from "./induct-app";
import knex from "knex";
import { ApplicationOpts } from "./app-schema";

const db = knex({
    client: "mssql",
});

const opts: ApplicationOpts = {
    db,
};

const app = new InductApp(opts);


const app2 = induct(opts);
