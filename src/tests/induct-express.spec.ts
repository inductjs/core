/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import {InductExpress} from "../induct-express";
import {mockOpts1, MockSchema, mockRequest, mockResponse} from "./mocks";
import {TestInduct} from "./induct-mock";
import ControllerResult, {IControllerResult} from "../controller-result";
import {StatusCode} from "../types/http-schema";

jest.mock("../controller-result");

describe("InductExpress", () => {
    it("Should expose method 'handler'", () => {
        const induct = new InductExpress(mockOpts1);

        expect(induct.handler).toBeDefined;
        expect(typeof induct.handler === "function").toBeTruthy;
    });

    it("Handler method should throw when an unsupported model method is supplied", () => {
        try {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;
            induct.handler("test" as any);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
            expect(e.message).toEqual(
                "test is not registered as a modify method"
            );
        }
    });

    it("Handler method should call the correct internal handler factory", () => {
        const induct = (new InductExpress(mockOpts1) as unknown) as TestInduct<
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

    it("instance should expose a method 'router'", () => {
        const induct = new InductExpress(mockOpts1);

        expect(induct.router).toBeDefined;
        expect(typeof induct.router === "function").toBeTruthy;
    });

    it("router should return an Express router", () => {
        const induct = (new InductExpress(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const router = induct.router();

        expect(typeof router).toEqual("function");
    });

    it("router method should add the correct routes", () => {
        const induct = (new InductExpress(mockOpts1) as unknown) as TestInduct<
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

    describe("lookupHandler", () => {
        it("should return a function", () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

            const handler = induct.lookupHandler("findAll");

            expect(typeof handler).toEqual("function");
        });

        it("should throw on an invalid lookup method", () => {
            try {
                const induct = (new InductExpress(
                    mockOpts1
                ) as unknown) as TestInduct<MockSchema>;
                induct.lookupHandler("test" as any);
            } catch (e) {
                expect(e).toBeInstanceOf(TypeError);
                expect(e.message).toEqual(
                    "test is not registered as a lookup method"
                );
            }
        });

        it("result should return status 200 with data when called with 'findOneById'", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.lookupHandler("findOneById");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });

        it("result should return status 200 with data when called with 'findAll'", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.lookupHandler("findAll");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });

        it("result should return status 404 if no data can be found", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.lookupHandler("findAll");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });

        it("result should return status 400 if model creation fails", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.lookupHandler("findAll");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });

        it("result should return status 500 status on other error", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.lookupHandler("findAll");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });
    });

    describe("modifyHandler", () => {
        it("should return a function", () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

            const handler = induct.modifyHandler("delete");

            expect(typeof handler).toEqual("function");
        });

        it("should throw on an invalid lookup method", () => {
            try {
                const induct = (new InductExpress(
                    mockOpts1
                ) as unknown) as TestInduct<MockSchema>;
                induct.modifyHandler("test" as any);
            } catch (e) {
                expect(e).toBeInstanceOf(TypeError);
                expect(e.message).toEqual(
                    "test is not registered as a modify method"
                );
            }
        });

        it("result should return status 400 if model creation fails", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.modifyHandler("create");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });

        it("result should return status 201 with data when called with 'create'", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.modifyHandler("create");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });

        it("result should return status 400 if creation fails when called with 'create'", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.modifyHandler("create");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });

        it("result should return status 200 with data when called with 'update'", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.modifyHandler("update");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });

        it("result should return status 400 if updating fails when called with 'update'", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.modifyHandler("update");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });

        it("result should return 204 status when called with 'delete'", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.modifyHandler("delete");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });

        it("result should return status 404 if no data can be found when called with 'delete'", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.modifyHandler("delete");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });

        it("result should return status 500 status on other error", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct.modifyHandler("create");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected);
        });
    });
});
