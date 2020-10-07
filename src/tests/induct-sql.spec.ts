/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type*/
import {InductSQL} from "../induct-sql";
import {mockSqlOpts, MockSchema} from "./data/fixtures";

describe("InductSQL", () => {
    it("Should expose method 'query'", () => {
        const induct = new InductSQL(mockSqlOpts);

        expect(induct.query).toBeDefined;
        expect(typeof induct.query === "function").toBeTruthy;
    });

    it("Should expose method 'mutation'", () => {
        const induct = new InductSQL(mockSqlOpts);

        expect(induct.mutation).toBeDefined;
        expect(typeof induct.mutation === "function").toBeTruthy;
    });

    it("Instance should expose method 'model'", () => {
        const induct = new InductSQL(mockSqlOpts);

        expect(induct.model).toBeDefined;
        expect(typeof induct.model === "function").toBeTruthy;
    });

    it("should expose method 'azureHttpTrigger'", () => {
        const induct = new InductSQL<MockSchema>(mockSqlOpts);

        expect(induct.azureHttpTrigger).toBeDefined;
        expect(typeof induct.azureHttpTrigger).toBe("function");
    });

    it("instance should expose a method 'router'", () => {
        const induct = new InductSQL(mockSqlOpts);

        expect(induct.router).toBeDefined;
        expect(typeof induct.router === "function").toBeTruthy;
    });

    it("should expose method 'azureHttpTrigger'", () => {
        const induct = new InductSQL<MockSchema>(mockSqlOpts);

        expect(induct.azureHttpTrigger).toBeDefined;
        expect(typeof induct.azureHttpTrigger).toBe("function");
    });
});
