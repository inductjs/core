import InductMongo from "../induct-mongo";
import {MockSchema, mockMongoOpts} from "./data/fixtures";

describe("InductMongo", () => {
    it("should expose method 'getMongoModel'", () => {
        const induct = new InductMongo<MockSchema>(mockMongoOpts);

        expect(induct.getMongoModel).toBeDefined;
        expect(typeof induct.getMongoModel).toBe("function");
    });

    it("should expose method 'azureHttpTrigger'", () => {
        const induct = new InductMongo<MockSchema>(mockMongoOpts);

        expect(induct.azureHttpTrigger).toBeDefined;
        expect(typeof induct.azureHttpTrigger).toBe("function");
    });

    it("Should expose method 'query'", () => {
        const induct = new InductMongo<MockSchema>(mockMongoOpts);

        expect(induct.query).toBeDefined;
        expect(typeof induct.query === "function").toBeTruthy;
    });

    it("Should expose method 'mutation'", () => {
        const induct = new InductMongo<MockSchema>(mockMongoOpts);

        expect(induct.mutation).toBeDefined;
        expect(typeof induct.mutation === "function").toBeTruthy;
    });

    it("Instance should expose method 'model'", () => {
        const induct = new InductMongo<MockSchema>(mockMongoOpts);

        expect(induct.model).toBeDefined;
        expect(typeof induct.model === "function").toBeTruthy;
    });
});
