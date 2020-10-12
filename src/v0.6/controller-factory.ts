import { mongoose } from "@typegoose/typegoose";
import { yellow } from "chalk";
import InductMongo from "../induct-mongo";
import { InductSQL } from "../induct-sql";
import { InductMongoOpts, InductSQLOpts } from "./types";
import { InductControllerOpts } from "./types";

/** Instantiates and returns either an InductSQL or InductMongo controller based on the provided options */
export const controller = <T>(opts: InductControllerOpts<T>): InductSQL<T> | InductMongo<T> => {
    const {db} = opts;

    if (db instanceof mongoose.Connection) {
        return new InductMongo(opts as InductMongoOpts<T>);
    } else if (opts.tableName) {
        return new InductSQL(opts as InductSQLOpts<T>) as InductSQL<T>;
    } else {
        console.log(yellow(`[warning] could not determine controller database type based on provided options. Falling back to InductSQL`));

        return new InductSQL(opts as InductSQLOpts<T>) as InductSQL<T>;
    }
};
