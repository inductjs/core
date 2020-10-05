/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import {InductExpress} from "../express/induct-express";
import {mockOpts1, MockSchema, mockRequest, mockResponse} from "./data/mocks";
import {TestInduct} from "./data/induct-mock";
import ControllerResult, {IControllerResult} from "../express/controller-result";
import {HttpStatusCode as StatusCode} from "azure-functions-ts-essentials";

jest.mock("../express/controller-result");

describe("InductExpress", () => {
    it("Should expose method 'query'", () => {
        const induct = new InductExpress(mockOpts1);

        expect(induct.query).toBeDefined;
        expect(typeof induct.query === "function").toBeTruthy;
    });

    it("Query method should throw when an unsupported model method is supplied", () => {
        try {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;
            induct.query("test" as any);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    it("Should expose method 'mutation'", () => {
        const induct = new InductExpress(mockOpts1);

        expect(induct.mutation).toBeDefined;
        expect(typeof induct.mutation === "function").toBeTruthy;
    });

    it("Mutation method should throw when an unsupported model method is supplied", () => {
        try {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;
            induct.mutation("test" as any);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
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

        jest.spyOn(induct, "query");
        jest.spyOn(induct, "mutation");

        const router = induct.router();

        expect(induct.query).toHaveBeenCalledTimes(2);
        expect(induct.mutation).toHaveBeenCalledTimes(3);
        expect(induct.mutation).toHaveBeenCalledWith("create", {validate: true});
        expect(induct.mutation).toHaveBeenCalledWith("update", {validate: true});
        expect(induct.query).toHaveBeenCalledWith("findOneById");
        expect(induct.query).toHaveBeenCalledWith("findAll");
        expect(induct.mutation).toHaveBeenCalledWith("delete");

        // Bit of a lazy test for now, can expand later to see if the correct paths/methods are present on the router
        expect(router.stack).toHaveLength(5);
    });

    describe("_createQueryHandler", () => {
        it("should return a function", () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

            const handler = induct._createQueryHandler("findAll");

            expect(typeof handler).toEqual("function");
        });

        it("should throw on an invalid lookup method", () => {
            try {
                const induct = (new InductExpress(
                    mockOpts1
                ) as unknown) as TestInduct<MockSchema>;
                induct._createQueryHandler("test" as any);
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

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createQueryHandler("findOneById");

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

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createQueryHandler("findAll");

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

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createQueryHandler("findAll");

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

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createQueryHandler("findAll");

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

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createQueryHandler("findAll");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
        });
    });

    describe("_createMutationHandler", () => {
        it("should return a function", () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

            const handler = induct._createMutationHandler("delete");

            expect(typeof handler).toEqual("function");
        });

        it("should throw on an invalid lookup method", () => {
            try {
                const induct = (new InductExpress(
                    mockOpts1
                ) as unknown) as TestInduct<MockSchema>;
                induct._createMutationHandler("test" as any);
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

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createMutationHandler("create");

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

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createMutationHandler("create");

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

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createMutationHandler("create");

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

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createMutationHandler("update");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
        });

        it("result should return status 404 if updating fails when called with 'update'", async () => {
            const induct = (new InductExpress(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();

            induct.modelFactory = jest.fn(() => {
                return {
                    update: async () => undefined,
                };
            }) as any;

            const expected = {
                res,
                status: StatusCode.NotFound,
            };

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createMutationHandler("update");

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

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createMutationHandler("delete");

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
                    delete: async () => undefined,
                };
            }) as any;

            const expected = {
                res,
                status: StatusCode.NotFound,
            };

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createMutationHandler("delete");

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

            jest.mock("../express/controller-result.ts", () => {
                return jest
                    .fn()
                    .mockImplementation(
                        (result: IControllerResult<MockSchema>) => {
                            return new ControllerResult(result);
                        }
                    );
            });

            const handler = induct._createMutationHandler("create");

            await handler(req, res, next);

            expect(ControllerResult).toHaveBeenCalledTimes(1);
            expect(ControllerResult).toHaveBeenCalledWith(expected, undefined);
        });
    });
});
