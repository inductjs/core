import {mockData1, MockMongoSchema, mockMongoOpts} from "./data/fixtures";
import MongoModelBase from "../mongo-model-base";

describe("MongoModelBase", () => {
    it("Model instance should expose method 'findAll'", () => {
        const model = new MongoModelBase<MockMongoSchema>(mockData1, mockMongoOpts);

        expect(model.findAll).toBeDefined;
        expect(typeof model.findAll).toBe("function");
    });

    it("Model instance should expose method 'findOneById'", () => {
        const model = new MongoModelBase<MockMongoSchema>(mockData1, mockMongoOpts);

        expect(model.findOneById).toBeDefined;
        expect(typeof model.findOneById).toBe("function");
    });

    it("Model instance should expose method 'create'", () => {
        const model = new MongoModelBase<MockMongoSchema>(mockData1, mockMongoOpts);

        expect(model.create).toBeDefined;
        expect(typeof model.create).toBe("function");
    });

    it("Model instance should expose method 'update'", () => {
        const model = new MongoModelBase<MockMongoSchema>(mockData1, mockMongoOpts);

        expect(model.update).toBeDefined;
        expect(typeof model.update).toBe("function");
    });

    it("Model instance should expose method 'delete'", () => {
        const model = new MongoModelBase<MockMongoSchema>(mockData1, mockMongoOpts);

        expect(model.delete).toBeDefined;
        expect(typeof model.delete).toBe("function");
    });

    it("Model instance should expose method 'get'", () => {
        const model = new MongoModelBase<MockMongoSchema>(mockData1, mockMongoOpts);

        expect(model.get).toBeDefined;
        expect(typeof model.get).toBe("function");
    });

    it("Model instance should expose method 'set'", () => {
        const model = new MongoModelBase<MockMongoSchema>(mockData1, mockMongoOpts);

        expect(model.set).toBeDefined;
        expect(typeof model.set).toBe("function");
    });
});
