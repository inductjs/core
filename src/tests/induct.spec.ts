/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import {InductSQL} from "../induct-sql";
import {
    mockSqlOpts,
    MockSchema,
    mockRequest,
    mockResponse,
    mockOptsOver,
    mockData1,
    mockInvalidData1,
    mockOptsCustomModel,
    mockOptsValidation,
    MockSQLModel,
} from "./data/fixtures";
import {TestInduct} from "./data/induct-mock";
import ControllerResult, {
    IControllerResult,
} from "../express/controller-result";
import {HttpStatusCode as StatusCode} from "azure-functions-ts-essentials";
import {InductSQLOpts} from "../types/induct";
import {SqlAdapter} from "../adapters/sql-adapter";
// import {InductMongo} from "../induct-mongo";

jest.mock("../express/controller-result");

describe("Induct Base", () => {
    describe("_copyOpts", () => {
        it("copyOpts should correctly override class properties", () => {
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const newOpts = induct._copyOpts(mockOptsOver) as InductSQLOpts<
                MockSchema
            >;

            expect(newOpts.idField).toEqual("string");
            expect(newOpts.tableName).toEqual("table2");
            expect(newOpts.schema).toEqual(MockSchema);
        });
    });

    describe("model", () => {
        it("Model method should return an instance of the correct model class", async () => {
            const sql = (new InductSQL(mockSqlOpts) as unknown) as TestInduct<
                MockSchema
            >;

            // const mongo = (new InductMongo(mockMongoOpts) as unknown) as TestInduct<MockSchema>;

            const modelsql = await sql.model(mockData1);
            // const modelmongo = await mongo.model(mockData1);

            expect(modelsql).toBeInstanceOf(SqlAdapter);
            // expect(modelmongo).toBeInstanceOf(MongoModelBase);
        });

        it("model method should return null when model factory fails", async () => {
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;
            induct._modelFactory = jest.fn(() => {
                throw new Error();
            }) as any;

            const model = await induct.model(mockInvalidData1 as any);
            expect(model).toBeNull;
        });
    });

    it("Query method should throw when an unsupported model method is supplied", () => {
        try {
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            induct.query("test" as any);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    it("Mutation method should throw when an unsupported model method is supplied", () => {
        try {
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            induct.mutation("test" as any);
        } catch (e) {
            expect(e).toBeInstanceOf(TypeError);
        }
    });

    it("router should return an Express router", () => {
        const induct = (new InductSQL(mockSqlOpts) as unknown) as TestInduct<
            MockSchema
        >;

        const router = induct.router();

        expect(typeof router).toEqual("function");
    });

    it("router method should add the correct routes", () => {
        const induct = (new InductSQL(mockSqlOpts) as unknown) as TestInduct<
            MockSchema
        >;

        jest.spyOn(induct, "query");
        jest.spyOn(induct, "mutation");

        const router = induct.router();

        expect(induct.query).toHaveBeenCalledTimes(2);
        expect(induct.mutation).toHaveBeenCalledTimes(3);
        expect(induct.mutation).toHaveBeenCalledWith("create", {
            validate: true,
        });
        expect(induct.mutation).toHaveBeenCalledWith("update", {
            validate: true,
        });
        expect(induct.query).toHaveBeenCalledWith("findOneById");
        expect(induct.query).toHaveBeenCalledWith("findAll");
        expect(induct.mutation).toHaveBeenCalledWith("delete");

        // Bit of a lazy test for now
        // can expand later to see if the correct paths/methods are present on the router
        expect(router.stack).toHaveLength(5);
    });

    describe("Induct Model Factory", () => {
        it("Should return an instance of InductModel", async () => {
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const model = await induct._modelFactory(mockData1, mockSqlOpts);

            expect(model).toBeInstanceOf(SqlAdapter);
        });

        it("Should return an instance of the custom model if one is provided", async () => {
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const model = await induct._modelFactory(
                mockData1,
                mockOptsCustomModel
            );

            expect(model).toBeInstanceOf(MockSQLModel);
        });

        it("Should return an instance of InductModel if data is valid and validation option is enabled", async () => {
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const model = await induct._modelFactory(
                mockData1,
                mockOptsValidation
            );

            expect(model).toBeInstanceOf(SqlAdapter);
        });

        it("Should throw when data is invalid and validation option is enabled", async () => {
            try {
                const induct = (new InductSQL(
                    mockSqlOpts
                ) as unknown) as TestInduct<MockSchema>;

                await induct._modelFactory(
                    mockInvalidData1 as any,
                    mockOptsValidation
                );
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toEqual("Schema validation failed");
            }
        });
    });

    describe("_createQueryHandler", () => {
        it("should return a function", () => {
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const handler = induct._createQueryHandler("findAll");

            expect(typeof handler).toEqual("function");
        });

        it("should throw on an invalid lookup method", () => {
            try {
                const induct = (new InductSQL(
                    mockSqlOpts
                ) as unknown) as TestInduct<MockSchema>;
                induct._createQueryHandler("test" as any);
            } catch (e) {
                expect(e).toBeInstanceOf(TypeError);
            }
        });

        it("result should return status 200 with data when called with 'findOneById'", async () => {
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            req.params[induct._idParam] = "test";
            const res = mockResponse();
            const next = jest.fn();

            induct._modelFactory = jest.fn(() => {
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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();

            induct._modelFactory = jest.fn(() => {
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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();

            induct._modelFactory = jest.fn(() => {
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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();

            induct._modelFactory = jest.fn(() => null) as any;

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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();
            const error = new Error("oeps");

            induct._modelFactory = jest.fn(() => {
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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const handler = induct._createMutationHandler("delete");

            expect(typeof handler).toEqual("function");
        });

        it("should throw on an invalid lookup method", () => {
            try {
                const induct = (new InductSQL(
                    mockSqlOpts
                ) as unknown) as TestInduct<MockSchema>;
                induct._createMutationHandler("test" as any);
            } catch (e) {
                expect(e).toBeInstanceOf(TypeError);
            }
        });

        it("result should return status 400 if model creation fails", async () => {
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();

            induct._modelFactory = jest.fn(() => null) as any;

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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();

            induct._modelFactory = jest.fn(() => {
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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();

            induct._modelFactory = jest.fn(() => {
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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            req.params[induct._idParam] = "test";
            const res = mockResponse();
            const next = jest.fn();

            induct._modelFactory = jest.fn(() => {
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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();

            induct._modelFactory = jest.fn(() => {
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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();

            induct._modelFactory = jest.fn(() => {
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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();

            induct._modelFactory = jest.fn(() => {
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
            const induct = (new InductSQL(
                mockSqlOpts
            ) as unknown) as TestInduct<MockSchema>;

            const req = mockRequest();
            const res = mockResponse();
            const next = jest.fn();
            const error = new Error("oeps");

            induct._modelFactory = jest.fn(() => {
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
