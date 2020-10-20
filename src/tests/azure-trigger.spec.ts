/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import {SqlStrategy} from "../strategies/sql-strategy";
import {Controller} from "../induct-controller";
import {
    mockSqlOpts,
    MockSchema,
    mockAzReq,
    mockAzContext,
} from "./data/fixtures";
import {TestInduct} from "./data/induct-mock";
import {HttpMethod} from "azure-functions-ts-essentials";

describe("Azure HTTP trigger", () => {
    it("Induct Instance should expose method 'azureHttpTrigger'", () => {
        const induct = new Controller("test", SqlStrategy, mockSqlOpts);

        expect(induct.azureHttpTrigger).toBeDefined;
        expect(typeof induct.azureHttpTrigger === "function").toBeTruthy;
    });

    describe("azureHttpTrigger", () => {
        it("should return a function", () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            const router = induct.azureHttpTrigger(mockSqlOpts);

            expect(typeof router).toEqual("function");
        });

        it("should return 400 status when model creation fails", async () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            induct._initStrategy = jest.fn(() => null) as any;

            const req = mockAzReq();
            req.params[induct._idField] = "test";
            req.method = HttpMethod.Get;
            const context = mockAzContext();

            const router = induct.azureHttpTrigger();

            const result = await router(context, req);

            expect(result.status).toEqual(400);
        });

        it("should return 200 status on GET when id parameter is provided", async () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            induct._initStrategy = jest.fn(() => {
                return {
                    findOneById: jest.fn(() => ["test"]),
                };
            }) as any;

            const req = mockAzReq();
            req.params["id"] = "test";
            req.method = HttpMethod.Get;
            const context = mockAzContext();

            const router = induct.azureHttpTrigger();

            const result = await router(context, req);

            expect(result.status).toEqual(200);
            expect(result.body).toEqual("test");
        });

        it("should return 200 status on GET when id parameter is not provided", async () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            induct._initStrategy = jest.fn(() => {
                return {
                    findAll: jest.fn(() => ["test", "test1"]),
                };
            }) as any;

            const req = mockAzReq();
            req.method = HttpMethod.Get;
            const context = mockAzContext();

            const router = induct.azureHttpTrigger();

            const result = await router(context, req);

            expect(result.status).toEqual(200);
            expect(result.body).toEqual(["test", "test1"]);
        });

        it("should return 201 status on successful POST", async () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            induct._initStrategy = jest.fn(() => {
                return {
                    create: jest.fn(() => "test"),
                };
            }) as any;

            const req = mockAzReq();
            req.method = HttpMethod.Post;
            const context = mockAzContext();

            const router = induct.azureHttpTrigger();

            const result = await router(context, req);

            expect(result.status).toEqual(201);
            expect(result.body).toEqual("test");
        });

        it("should return 400 status on failed POST", async () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            induct._initStrategy = jest.fn(() => {
                return {
                    create: jest.fn(() => null),
                };
            }) as any;

            const req = mockAzReq();
            req.method = HttpMethod.Post;
            const context = mockAzContext();

            const router = induct.azureHttpTrigger();

            const result = await router(context, req);

            expect(result.status).toEqual(400);
            expect(result.body).toEqual("Bad request");
        });

        it("should return 200 status on successful PATCH", async () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            induct._initStrategy = jest.fn(() => {
                return {
                    update: jest.fn(() => "test"),
                };
            }) as any;

            const req = mockAzReq();
            req.method = HttpMethod.Patch;
            req.params.id = "test";
            const context = mockAzContext();

            const router = induct.azureHttpTrigger();

            const result = await router(context, req);

            expect(result.status).toEqual(200);
            expect(result.body).toEqual("test");
        });

        it("should return 400 status on failed PATCH", async () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            induct._initStrategy = jest.fn(() => {
                return {
                    update: jest.fn(() => null),
                };
            }) as any;

            const req = mockAzReq();
            req.method = HttpMethod.Patch;
            const context = mockAzContext();

            const router = induct.azureHttpTrigger();

            const result = await router(context, req);

            expect(result.status).toEqual(400);
            expect(result.body).toEqual("Bad request");
        });

        it("should return 204 status on successful DELETE", async () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            induct._initStrategy = jest.fn(() => {
                return {
                    delete: jest.fn(() => "test"),
                };
            }) as any;

            const req = mockAzReq();
            req.method = HttpMethod.Delete;
            req.params.id = "test";
            const context = mockAzContext();

            const router = induct.azureHttpTrigger();

            const result = await router(context, req);

            expect(result.status).toEqual(204);
            expect(result.body).toEqual("test");
        });

        it("should return 404 status on failed DELETE", async () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            induct._initStrategy = jest.fn(() => {
                return {
                    delete: jest.fn(() => null),
                };
            }) as any;

            const req = mockAzReq();
            req.method = HttpMethod.Delete;
            req.params.id = "test";
            const context = mockAzContext();

            const router = induct.azureHttpTrigger();

            const result = await router(context, req);

            expect(result.status).toEqual(404);
            expect(result.body).toEqual("Resource not found");
        });

        it("should return 405 status on other METHOD", async () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            induct._initStrategy = jest.fn(() => {
                return {
                    delete: jest.fn(() => null),
                };
            }) as any;

            const req = mockAzReq();
            req.method = HttpMethod.Put;
            req.params.id = "test";
            const context = mockAzContext();

            const router = induct.azureHttpTrigger();

            const result = await router(context, req);

            expect(result.status).toEqual(405);
            expect(result.body).toEqual("Method not allowed");
        });

        it("should return 500 status on other error", async () => {
            const induct = (new Controller("test", SqlStrategy, mockSqlOpts) as unknown) as TestInduct<MockSchema>;

            induct._initStrategy = jest.fn(() => {
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

            const router = induct.azureHttpTrigger();

            const result = await router(context, req);

            expect(result.status).toEqual(500);
            expect(result.error).toBeDefined;
        });
    });
});
