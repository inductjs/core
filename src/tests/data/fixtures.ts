/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul-ignore */
import {
   InductOptions
} from "../../types/induct";
import {IsInt, IsString} from "class-validator";
import {Response, Request} from "express";
import mdb from "./mockDb";
import {HttpRequest, Context} from "@azure/functions";
import {SqlStrategy} from "../../strategies/sql-strategy";
import {prop} from "@typegoose/typegoose";
import { Strategy } from "../../strategies/abstract-strategy";

export class TestError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "TestError";
    }
}

export const mockRequest = (): Request => {
    const req = {} as Request;
    req.params = {};
    req.body = {};
    req.cookies = {};
    req.headers = {};
    req.originalUrl = "";
    req.ip = "127.0.0.1";

    req.get = jest.fn().mockImplementation((str: string) => str);

    return req;
};

export const mockAzReq = (): HttpRequest => {
    const req = {} as HttpRequest;
    req.method = null;
    req.url = "";
    req.headers = {};
    req.query = {};
    req.params = {};
    req.body = {};
    req.rawBody = {};

    return req;
};

export const mockAzContext = (): Context => {
    const con = {} as Context;
    con.invocationId = "";
    con.executionContext = {
        invocationId: "",
        functionName: "",
        functionDirectory: "",
    };
    con.bindings = {};
    con.bindingData = {};
    con.traceContext = {
        traceparent: "",
        tracestate: "",
        attributes: {},
    };
    con.bindingDefinitions = [
        {
            name: "",
            type: "",
            direction: "in",
        },
    ];

    return con;
};

export const mockResponse = (): Response => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);

    return res;
};

export class MockSchema {
    @IsString()
    string: string;
    @IsInt()
    int: number;

    constructor(val: MockSchema) {
        Object.assign(this, val);
    }
}

const mockMongoCon = {
    connection: (): string => "hallo",
    /* eslint-disable-next-line */
    model: (one: any, two: any): string => "model",
    models: {MockMongoSchema: {}}
};

export class CustomStrategy extends SqlStrategy<MockSchema> {
    constructor(
        val: MockSchema,
        opts: InductOptions<MockSchema>,
        public customProp: string = "This is a custom property"
    ) {
        super(val, opts);
    }

    customMethod(): string {
        return "This is a custom method";
    }
}

export class MockMongoSchema {
    @prop()
    string: string;
    @prop()
    int: number;

    constructor(val: MockMongoSchema) {
        Object.assign(this, val);
    }
}

export const mockData1 = {
    string: "Hallo",
    int: 23,
};

export const mockInvalidData1 = {
    string: 123,
    int: 10,
};

export const mockSqlOpts: InductOptions<MockSchema> = {
    db: mdb,
    schema: MockSchema,
    tableName: "table",
    idField: "string",
};

export const mockMongoOpts: InductOptions<MockMongoSchema> = {
    db: mockMongoCon as any,
    schema: MockMongoSchema,
    idField: "int",
};

export const mockOptsOver: Partial<InductOptions<MockSchema>> = {
    tableName: "table2",
    idField: "string",
};

export const mockOptsCustomModel: InductOptions<MockSchema> = {
    ...mockSqlOpts,
};

export const mockOptsValidation: InductOptions<MockSchema> = {
    ...mockSqlOpts,
    validate: true,
};

export const mockOptsFieldsList: InductOptions<MockSchema> = {
    ...mockSqlOpts,
    fields: ["string"],
};
