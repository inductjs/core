/* eslint-disable */
import {describe, it} from "@jest/globals";
import Induct from "../induct";
import {TestInduct} from "./data/induct-mock";
import {
    mockData1,
    mockOpts1,
    mockOptsOver,
    MockSchema,
    mockInvalidData1,
} from "./data/mocks";
import InductModel from "../base-model";

jest.mock("./data/mockDb.ts", () => {
    const mknex = {};
    return jest.fn(() => mknex);
});

describe("Induct", () => {
    it("copyOpts should correctly override class properties", () => {
        const induct = (new Induct(mockOpts1) as unknown) as TestInduct<
            MockSchema
        >;

        const newOpts = induct._copyOpts(mockOptsOver);

        expect(newOpts.idField).toEqual("string");
        expect(newOpts.tableName).toEqual("table2");
        expect(newOpts.schema).toEqual(MockSchema);
    });

    it("Instance should expose method 'model'", () => {
        const induct = new Induct(mockOpts1);

        expect(induct.model).toBeDefined;
        expect(typeof induct.model === "function").toBeTruthy;
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
