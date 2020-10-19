import { AdapterFunction } from "../../types/model-schema";
import {BasicUserSql} from "../schemas/basic-user";
import Knex from "knex";
import SqlStrategy from "../../strategies/sql-strategy";
import { InductOptions } from "../../types/induct";
import { Controller } from "../../induct-controller";

class UserStrategy extends SqlStrategy<BasicUserSql> {
    findOneByEmail: AdapterFunction<BasicUserSql>;

    constructor(val: BasicUserSql, opts: InductOptions<BasicUserSql>) {
        super(val, opts);

        this.findOneByEmail = this.adapterFunction("email", "find", "findOneByEmail").bind(this);
    }
}


export const createUserController = async (db: Knex, tableName?: string) => {
    // Create table if not exists ${tableName}

    const userController = new Controller("user", UserStrategy, {
        db,
        tableName: tableName,
        schema: BasicUserSql,
        idField: "userId",
    });

    const router = userController.defaultRouter();
    router.get("/")
    

    return userController;
};

