import { prop } from "@inductjs/core";

class UserSchema {
    @prop()
    public id?: number

    @prop()
    public userName?: string;

    constructor(args: UserSchema) {
        Object.assign(this, args);
    }
}

export {UserSchema};