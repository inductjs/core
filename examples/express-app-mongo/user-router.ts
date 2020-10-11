import {UserSchema} from "./models/user-model";
import {InductMongo} from "@inductjs/core";
import {con} from "./index";

const induct = new InductMongo({
    db: con,
    schema: UserSchema,
    idField: "id",
});

const router = induct.router();

export { router };
