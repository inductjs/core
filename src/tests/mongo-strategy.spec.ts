import {mockData1, MockMongoSchema, mockMongoOpts} from "./data/fixtures";
import MongoAdapter from "../strategies/mongo-strategy";

describe("Mongo Strategy", () => {
    it("Model instance should expose method 'findAll'", () => {
        const model = new MongoAdapter<MockMongoSchema>(
            mockData1,
            mockMongoOpts
        );

        expect(model.findAll).toBeDefined;
        expect(typeof model.findAll).toBe("function");
    });

    it("Model instance should expose method 'findOneById'", () => {
        const model = new MongoAdapter<MockMongoSchema>(
            mockData1,
            mockMongoOpts
        );

        expect(model.findOneById).toBeDefined;
        expect(typeof model.findOneById).toBe("function");
    });

    it("Model instance should expose method 'create'", () => {
        const model = new MongoAdapter<MockMongoSchema>(
            mockData1,
            mockMongoOpts
        );

        expect(model.create).toBeDefined;
        expect(typeof model.create).toBe("function");
    });

    it("Model instance should expose method 'update'", () => {
        const model = new MongoAdapter<MockMongoSchema>(
            mockData1,
            mockMongoOpts
        );

        expect(model.update).toBeDefined;
        expect(typeof model.update).toBe("function");
    });

    it("Model instance should expose method 'delete'", () => {
        const model = new MongoAdapter<MockMongoSchema>(
            mockData1,
            mockMongoOpts
        );

        expect(model.delete).toBeDefined;
        expect(typeof model.delete).toBe("function");
    });
});
