import { InductSQLOpts } from "../../types/induct";
import {SqlAdapter} from "../../adapters/sql-adapter";
import { AdapterFunction } from "../../types/model-schema";
import {InductSQL} from "../../induct-sql";
import {BasicUserSql} from "../schemas/basic-user";
import Knex from "knex";

class UserSQLModel extends SqlAdapter<BasicUserSql> {
    findOneByEmail: AdapterFunction<BasicUserSql>;

    constructor(val: BasicUserSql, opts: InductSQLOpts<BasicUserSql>) {
        super(val, opts);

        this.findOneByEmail = this.adapterFunction("email", "find", "findOneByEmail").bind(this);
    }
}


export const createUserController = async (db: Knex, tableName?: string) => {
    // Create table if not exists ${tableName}

    const userController = new InductSQL({
        db,
        tableName: tableName,
        schema: BasicUserSql,
        idField: "userId",
        customModel: UserSQLModel,
    });

    return userController;
};

