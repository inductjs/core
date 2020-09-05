/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import {InductAzure} from "../induct-azure";
import {mockOpts1, MockSchema, mockAzReq, mockAzContext} from "./mocks";
import {TestInduct} from "./induct-mock";
import {HttpMethod} from "azure-functions-ts-essentials";

describe("InductAzure", () => {
    it("Instance should expose method 'azureFunctionsRouter'", () => {
        const induct = new InductAzure(mockOpts1);

        expect(induct.azureFunctionsRouter).toBeDefined;
        expect(typeof induct.azureFunctionsRouter === "function").toBeTruthy;
    });

    describe("azureFunctionsRouter", () => {
        it("should return a function", () => {
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

            const router = induct.azureFunctionsRouter(mockOpts1);

            expect(typeof router).toEqual("function");
        });

        it("should return 400 status when model creation fails", async () => {
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
            const induct = (new InductAzure(
                mockOpts1
            ) as unknown) as TestInduct<MockSchema>;

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
});
