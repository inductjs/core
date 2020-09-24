/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import {InductExpress} from "../induct-express";
import {mockOpts1, MockSchema, mockRequest, mockResponse} from "./data/mocks";
import {TestInduct} from "./data/induct-mock";
import ControllerResult, {IControllerResult} from "../controller-result";
import {HttpStatusCode as StatusCode} from "azure-functions-ts-essentials";

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
        }
    });

    it("Handler method should call the correct internal handler factory", () => {
        const induct = (new InductExpress(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        induct.queryHandler = jest.fn();
        induct.mutationHandler = jest.fn();

        induct.handler("findOneById");
        induct.handler("findAll");
        induct.handler("create");
        induct.handler("update");
        induct.handler("delete");

        expect(induct.queryHandler).toHaveBeenCalledTimes(2);
        expect(induct.mutationHandler).toHaveBeenCalledTimes(3);
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

    describe("queryHandler", () => {
        it("should return a function", () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

            const handler = induct.queryHandler("findAll");

            expect(typeof handler).toEqual("function");
        });

        it("should throw on an invalid lookup method", () => {
            try {
                const induct = (new InductExpress(
                    mockOpts1
                ) as unknown) as TestInduct<MockSchema>;
                induct.queryHandler("test" as any);
            } catch (e) {
                expect(e).toBeInstanceOf(TypeError);
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

            const handler = induct.queryHandler("findOneById");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
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

            const handler = induct.queryHandler("findAll");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
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
                status: StatusCode.NotFound,
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

            const handler = induct.queryHandler("findAll");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
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
                status: StatusCode.BadRequest,
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

            const handler = induct.queryHandler("findAll");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
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
                status: StatusCode.InternalServerError,
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

            const handler = induct.queryHandler("findAll");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
        });
    });

    describe("mutationHandler", () => {
        it("should return a function", () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

            const handler = induct.mutationHandler("delete");

            expect(typeof handler).toEqual("function");
        });

        it("should throw on an invalid lookup method", () => {
            try {
                const induct = (new InductExpress(
                    mockOpts1
                ) as unknown) as TestInduct<MockSchema>;
                induct.mutationHandler("test" as any);
            } catch (e) {
                expect(e).toBeInstanceOf(TypeError);
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
                status: StatusCode.BadRequest,
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

            const handler = induct.mutationHandler("create");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
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
                status: StatusCode.Created,
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

            const handler = induct.mutationHandler("create");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
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
                status: StatusCode.BadRequest,
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

            const handler = induct.mutationHandler("create");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
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

            const handler = induct.mutationHandler("update");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
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
                status: StatusCode.NotFound,
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

            const handler = induct.mutationHandler("update");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
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
                status: StatusCode.NoContent,
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

            const handler = induct.mutationHandler("delete");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
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
                status: StatusCode.NotFound,
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

            const handler = induct.mutationHandler("delete");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
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
                status: StatusCode.InternalServerError,
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

            const handler = induct.mutationHandler("create");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
        });
    });
});
