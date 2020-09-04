/* eslint-disable */
import {describe, it} from "@jest/globals";
import Induct from "../induct";
import {TestInduct} from "./induct-mock";
import {
    mockData1,
    mockOpts1,
    mockOptsOver,
    MockSchema,
    mockRequest,
    mockResponse,
    mockInvalidData1,
    mockAzReq,
    mockAzContext,
} from "./mocks";
import InductModel from "../base-model";
import ControllerResult, {IControllerResult} from "../controller-result";
import {StatusCode} from "../types/http-schema";
import {HttpMethod} from "azure-functions-ts-essentials";

jest.mock("./mockDb.ts", () => {
    const mknex = {};
    return jest.fn(() => mknex);
});

jest.mock("../controller-result");

describe("Induct", () => {
    it("Should expose method 'handler'", () => {
        const induct = new Induct(mockOpts1);

        expect(induct.handler).toBeDefined;
        expect(typeof induct.handler === "function").toBeTruthy;
    });

    it("Instance should expose method 'azureFunctionsRouter'", () => {
        const induct = new Induct(mockOpts1);

        expect(induct.azureFunctionsRouter).toBeDefined;
        expect(typeof induct.azureFunctionsRouter === "function").toBeTruthy;
    });

    it("Instance should expose method 'model'", () => {
        const induct = new Induct(mockOpts1);

        expect(induct.model).toBeDefined;
        expect(typeof induct.model === "function").toBeTruthy;
    });

    it("Instance should expose method 'router'", () => {
        const induct = new Induct(mockOpts1);

        expect(induct.router).toBeDefined;
        expect(typeof induct.router === "function").toBeTruthy;
    });

    it("Handler method should call the correct internal handler factory", () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.lookupHandler = jest.fn();
        induct.modifyHandler = jest.fn();

        induct.handler("findOneById");
        induct.handler("findAll");
        induct.handler("create");
        induct.handler("update");
        induct.handler("delete");

        expect(induct.lookupHandler).toHaveBeenCalledTimes(2);
        expect(induct.modifyHandler).toHaveBeenCalledTimes(3);
    });

    it("Handler method should throw when an unsupported model method is supplied", () => {
        try {
            const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
                MockSchema
            >;
            induct.handler("test" as any);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
            expect(e.message).toEqual(
                "test is not supported as a modify method"
            );
        }
    });

    it("copyOpts internal method should correctly override class properties", () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const newOpts = induct._copyOpts(mockOptsOver);

        expect(newOpts.idField).toEqual("string");
        expect(newOpts.tableName).toEqual("table2");
        expect(newOpts.schema).toEqual(MockSchema);
    });

    it("router should return an Express router", () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const router = induct.router();

        expect(typeof router).toEqual("function");
    });

    it("router method should add the correct routes", () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        jest.spyOn(induct, "handler");

        const router = induct.router();

        expect(induct.handler).toHaveBeenCalledTimes(5);
        expect(induct.handler).toHaveBeenCalledWith("create", {validate: true});
        expect(induct.handler).toHaveBeenCalledWith("update", {validate: true});
        expect(induct.handler).toHaveBeenCalledWith("findOneById");
        expect(induct.handler).toHaveBeenCalledWith("findAll");
        expect(induct.handler).toHaveBeenCalledWith("delete");

        // Bit of a lazy test for now, can expand later to see if the correct paths/methods are present on the router
        expect(router.stack).toHaveLength(5);
    });

    it("Model method should return an instance of an InductModel", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;
        const model = await induct.model(mockData1);

        expect(model).toBeInstanceOf(InductModel);
    });

    it("model method should return null when model factory fails", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;
        induct.modelFactory = jest.fn(() => {
            throw new Error();
        }) as any;

        const model = await induct.model(mockInvalidData1);
        expect(model).toBeNull;
    });
});

describe("lookupHandler", () => {
    it("should return a function", () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const handler = induct.lookupHandler("findAll");

        expect(typeof handler).toEqual("function");
    });

    it("should throw on an invalid lookup method", () => {
        try {
            const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
                MockSchema
            >;
            induct.lookupHandler("test" as any);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
            expect(e.message).toEqual(
                "test is not supported as a lookup method"
            );
        }
    });

    it("result should return status 200 with data when called with 'findOneById'", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        req.params[induct.idParam] = "test";
        const res = mockResponse();
        const next = jest.fn();

        induct.modelFactory = jest.fn(() => {
            return {
                findOneById: async () => ["test"],
            };
        }) as any;

        const expected = {
            res,
            status: StatusCode.OK,
            data: "test",
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.lookupHandler("findOneById");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });

    it("result should return status 200 with data when called with 'findAll'", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        induct.modelFactory = jest.fn(() => {
            return {
                findAll: async () => ["test", "test2"],
            };
        }) as any;

        const expected = {
            res,
            status: StatusCode.OK,
            data: ["test", "test2"],
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.lookupHandler("findAll");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });

    it("result should return status 404 if no data can be found", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        induct.modelFactory = jest.fn(() => {
            return {
                findAll: async () => [],
            };
        }) as any;

        const expected = {
            res,
            status: StatusCode.NOT_FOUND,
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.lookupHandler("findAll");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });

    it("result should return status 400 if model creation fails", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        induct.modelFactory = jest.fn(() => null) as any;

        const expected = {
            res,
            status: StatusCode.BAD_REQUEST,
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.lookupHandler("findAll");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });

    it("result should return status 500 status on other error", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();
        const error = new Error("oeps");

        induct.modelFactory = jest.fn(() => {
            return {
                findAll: () => {
                    throw error;
                },
            };
        }) as any;

        const expected = {
            res,
            error,
            status: StatusCode.INTERNAL_SERVER_ERROR,
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.lookupHandler("findAll");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });
});

describe("modifyHandler", () => {
    it("should return a function", () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const handler = induct.modifyHandler("delete");

        expect(typeof handler).toEqual("function");
    });

    it("should throw on an invalid lookup method", () => {
        try {
            const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
                MockSchema
            >;
            induct.modifyHandler("test" as any);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
            expect(e.message).toEqual(
                "test is not supported as a modify method"
            );
        }
    });

    it("result should return status 400 if model creation fails", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        induct.modelFactory = jest.fn(() => null) as any;

        const expected = {
            res,
            status: StatusCode.BAD_REQUEST,
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.modifyHandler("create");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });

    it("result should return status 201 with data when called with 'create'", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        induct.modelFactory = jest.fn(() => {
            return {
                create: async () => "test",
            };
        }) as any;

        const expected = {
            res,
            status: StatusCode.CREATED,
            data: "test",
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.modifyHandler("create");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });

    it("result should return status 400 if creation fails when called with 'create'", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        induct.modelFactory = jest.fn(() => {
            return {
                create: async () => null,
            };
        }) as any;

        const expected = {
            res,
            status: StatusCode.BAD_REQUEST,
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.modifyHandler("create");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });

    it("result should return status 200 with data when called with 'update'", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        req.params[induct.idParam] = "test";
        const res = mockResponse();
        const next = jest.fn();

        induct.modelFactory = jest.fn(() => {
            return {
                update: async () => "test",
            };
        }) as any;

        const expected = {
            res,
            status: StatusCode.OK,
            data: "test",
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.modifyHandler("update");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });

    it("result should return status 400 if updating fails when called with 'update'", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        induct.modelFactory = jest.fn(() => {
            return {
                update: async () => null,
            };
        }) as any;

        const expected = {
            res,
            status: StatusCode.NOT_FOUND,
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.modifyHandler("update");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });

    it("result should return 204 status when called with 'delete'", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        induct.modelFactory = jest.fn(() => {
            return {
                delete: async () => "test",
            };
        }) as any;

        const expected = {
            res,
            status: StatusCode.NO_CONTENT,
            data: "test",
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.modifyHandler("delete");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });

    it("result should return status 404 if no data can be found when called with 'delete'", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();

        induct.modelFactory = jest.fn(() => {
            return {
                delete: async () => null,
            };
        }) as any;

        const expected = {
            res,
            status: StatusCode.NOT_FOUND,
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.modifyHandler("delete");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });

    it("result should return status 500 status on other error", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const req = mockRequest();
        const res = mockResponse();
        const next = jest.fn();
        const error = new Error("oeps");

        induct.modelFactory = jest.fn(() => {
            return {
                create: () => {
                    throw error;
                },
            };
        }) as any;

        const expected = {
            res,
            error,
            status: StatusCode.INTERNAL_SERVER_ERROR,
        };

        jest.mock("../controller-result.ts", () => {
            return jest
                .fn()
                .mockImplementation((result: IControllerResult<MockSchema>) => {
                    return new ControllerResult(result);
                });
        });

        const handler = induct.modifyHandler("create");

        const result = await handler(req, res, next);

        expect(ControllerResult).toHaveBeenCalledTimes(1);
        expect(ControllerResult).toHaveBeenCalledWith(expected);
    });
});

describe("azureFunctionsRouter", () => {
    it("should return a function", () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const router = induct.azureFunctionsRouter(mockOpts1);

        expect(typeof router).toEqual("function");
    });

    it("should return 400 status when model creation fails", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.modelFactory = jest.fn(() => null) as any;

        const req = mockAzReq();
        req.params[induct.idField] = "test";
        req.method = HttpMethod.Get;
        const context = mockAzContext();

        const router = induct.azureFunctionsRouter();

        const result = await router(context, req);

        expect(result.status).toEqual(400);
    });

    it("should return 200 status on GET when id parameter is provided", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.modelFactory = jest.fn(() => {
            return {
                findOneById: jest.fn(() => ["test"]),
            };
        }) as any;

        const req = mockAzReq();
        req.params["id"] = "test";
        req.method = HttpMethod.Get;
        const context = mockAzContext();

        const router = induct.azureFunctionsRouter();

        const result = await router(context, req);

        expect(result.status).toEqual(200);
        expect(result.body).toEqual("test");
    });

    it("should return 200 status on GET when id parameter is not provided", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.modelFactory = jest.fn(() => {
            return {
                findAll: jest.fn(() => ["test", "test1"]),
            };
        }) as any;

        const req = mockAzReq();
        req.method = HttpMethod.Get;
        const context = mockAzContext();

        const router = induct.azureFunctionsRouter();

        const result = await router(context, req);

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(["test", "test1"]);
    });

    it("should return 201 status on successful POST", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.modelFactory = jest.fn(() => {
            return {
                create: jest.fn(() => "test"),
            };
        }) as any;

        const req = mockAzReq();
        req.method = HttpMethod.Post;
        const context = mockAzContext();

        const router = induct.azureFunctionsRouter();

        const result = await router(context, req);

        expect(result.status).toEqual(201);
        expect(result.body).toEqual("test");
    });

    it("should return 400 status on failed POST", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.modelFactory = jest.fn(() => {
            return {
                create: jest.fn(() => null),
            };
        }) as any;

        const req = mockAzReq();
        req.method = HttpMethod.Post;
        const context = mockAzContext();

        const router = induct.azureFunctionsRouter();

        const result = await router(context, req);

        expect(result.status).toEqual(400);
        expect(result.body).toEqual("Bad request");
    });

    it("should return 200 status on successful PATCH", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.modelFactory = jest.fn(() => {
            return {
                update: jest.fn(() => "test"),
            };
        }) as any;

        const req = mockAzReq();
        req.method = HttpMethod.Patch;
        req.params.id = "test";
        const context = mockAzContext();

        const router = induct.azureFunctionsRouter();

        const result = await router(context, req);

        expect(result.status).toEqual(200);
        expect(result.body).toEqual("test");
    });

    it("should return 400 status on failed PATCH", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.modelFactory = jest.fn(() => {
            return {
                update: jest.fn(() => null),
            };
        }) as any;

        const req = mockAzReq();
        req.method = HttpMethod.Patch;
        const context = mockAzContext();

        const router = induct.azureFunctionsRouter();

        const result = await router(context, req);

        expect(result.status).toEqual(400);
        expect(result.body).toEqual("Bad request");
    });

    it("should return 204 status on successful DELETE", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.modelFactory = jest.fn(() => {
            return {
                delete: jest.fn(() => "test"),
            };
        }) as any;

        const req = mockAzReq();
        req.method = HttpMethod.Delete;
        req.params.id = "test";
        const context = mockAzContext();

        const router = induct.azureFunctionsRouter();

        const result = await router(context, req);

        expect(result.status).toEqual(204);
        expect(result.body).toEqual("test");
    });

    it("should return 404 status on failed DELETE", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.modelFactory = jest.fn(() => {
            return {
                delete: jest.fn(() => null),
            };
        }) as any;

        const req = mockAzReq();
        req.method = HttpMethod.Delete;
        req.params.id = "test";
        const context = mockAzContext();

        const router = induct.azureFunctionsRouter();

        const result = await router(context, req);

        expect(result.status).toEqual(404);
        expect(result.body).toEqual("Resource not found");
    });

    it("should return 405 status on other METHOD", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.modelFactory = jest.fn(() => {
            return {
                delete: jest.fn(() => null),
            };
        }) as any;

        const req = mockAzReq();
        req.method = HttpMethod.Put;
        req.params.id = "test";
        const context = mockAzContext();

        const router = induct.azureFunctionsRouter();

        const result = await router(context, req);

        expect(result.status).toEqual(405);
        expect(result.body).toEqual("Method not allowed");
    });

    it("should return 500 status on other error", async () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.modelFactory = jest.fn(() => {
            return {
                delete: jest.fn(() => {
                    throw Error();
                }),
            };
        }) as any;

        const req = mockAzReq();
        req.method = HttpMethod.Delete;
        req.params.id = "test";
        const context = mockAzContext();

        const router = induct.azureFunctionsRouter();

        const result = await router(context, req);

        expect(result.status).toEqual(500);
        expect(result.error).toBeDefined;
    });
});
