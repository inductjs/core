/* eslint-disable new-cap */
/* istanbul-ignore */
import {InductModel} from "../../base-model";
import {InductModelOpts} from "../../types/model-schema";
import {IsInt, IsString} from "class-validator";
import {Response, Request} from "express";
import mdb from "./mockDb";
import {HttpRequest, Context} from "@azure/functions";

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
    string: unknown;
    @IsInt()
    int: unknown;

    constructor(val: MockSchema) {
        Object.assign(this, val);
    }
}

export class MockCustomModel extends InductModel<MockSchema> {
    constructor(
        val: MockSchema,
        opts: InductModelOpts<MockSchema>,
        public customProp: string = "This is a custom property"
    ) {
        super(val, opts);
    }

    customMethod(): string {
        return "This is a custom method";
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

export const mockOpts1: InductModelOpts<MockSchema> = {
    connection: mdb,
    schema: MockSchema,
    tableName: "table",
    idField: "int",
};

export const mockOptsOver: Partial<InductModelOpts<MockSchema>> = {
    tableName: "table2",
    idField: "string",
};

export const mockOptsCustomModel: InductModelOpts<MockSchema> = {
    ...mockOpts1,
    customModel: MockCustomModel,
};

export const mockOptsValidation: InductModelOpts<MockSchema> = {
    ...mockOpts1,
    validate: true,
};

export const mockOptsFieldsList: InductModelOpts<MockSchema> = {
    ...mockOpts1,
    fields: ["string"],
};
