import {describe, it} from "@jest/globals";
import {
    MockCustomModel,
    mockData1,
    mockInvalidData1,
    mockOpts1,
    mockOptsCustomModel,
    mockOptsValidation,
} from "./mocks";
import {inductModelFactory} from "../model-factory";
import InductModel from "../base-model";
import {ValidationError} from "../types/error-schema";

jest.mock("./mockDb.ts", () => {
    const mknex = {};
    return jest.fn(() => mknex);
});

describe("Induct Model Factory", () => {
    it("Should return an instance of InductModel", async () => {
        const model = await inductModelFactory(mockData1, mockOpts1);

        expect(model).toBeInstanceOf(InductModel);
    });

    it("Should return an instance of the custom model if one is provided", async () => {
        const model = await inductModelFactory(mockData1, mockOptsCustomModel);

        expect(model).toBeInstanceOf(MockCustomModel);
    });

    it("Should return an instance of InductModel if data is valid and validation option is enabled", async () => {
        const model = await inductModelFactory(mockData1, mockOptsValidation);

        expect(model).toBeInstanceOf(InductModel);
    });

    it("Should throw when data is invalid and validation option is enabled", async () => {
        try {
            await inductModelFactory(mockInvalidData1, mockOptsValidation);
        } catch (e) {
            expect(e).toBeInstanceOf(ValidationError);
            expect(e.message).toEqual("Schema validation failed");
        }
    });
});
