/* eslint-disable new-cap */

import {prop} from "@typegoose/typegoose";

import {IsString, IsInt, IsEmail} from "class-validator";

export type UserRole = "user" | "admin"

export class BasicUserSql {
    @IsInt()
    userId: number;
    @IsEmail()
    email: string;
    @IsString()
    role: UserRole;
    firstName?: string;
    lastName?: string;

    constructor(val: BasicUserSql) {
        Object.assign(this, val);
    }
}

export class BasicUserMongo {
    @prop()
    userId: number;
    @prop()
    email: string;
    @prop()
    role: UserRole;
    firstName?: string;
    lastName?: string;

    constructor(val: BasicUserMongo) {
        Object.assign(this, val);
    }
}
