import {mockData1, MockSchema, mockSqlOpts} from "./data/fixtures";
import SqlModelBase from "../adapters/sql-adapter";

describe("SQL Adapter", () => {
    it("Model instance should expose method 'findAll'", () => {
        const model = new SqlModelBase<MockSchema>(mockData1, mockSqlOpts);

        expect(model.findAll).toBeDefined;
        expect(typeof model.findAll).toBe("function");
    });

    it("Model instance should expose method 'findOneById'", () => {
        const model = new SqlModelBase<MockSchema>(mockData1, mockSqlOpts);

        expect(model.findOneById).toBeDefined;
        expect(typeof model.findOneById).toBe("function");
    });

    it("Model instance should expose method 'create'", () => {
        const model = new SqlModelBase<MockSchema>(mockData1, mockSqlOpts);

        expect(model.create).toBeDefined;
        expect(typeof model.create).toBe("function");
    });

    it("Model instance should expose method 'update'", () => {
        const model = new SqlModelBase<MockSchema>(mockData1, mockSqlOpts);

        expect(model.update).toBeDefined;
        expect(typeof model.update).toBe("function");
    });

    it("Model instance should expose method 'delete'", () => {
        const model = new SqlModelBase<MockSchema>(mockData1, mockSqlOpts);

        expect(model.delete).toBeDefined;
        expect(typeof model.delete).toBe("function");
    });

    it("Model instance should expose method 'get'", () => {
        const model = new SqlModelBase<MockSchema>(mockData1, mockSqlOpts);

        expect(model.get).toBeDefined;
        expect(typeof model.get).toBe("function");
    });

    it("Model instance should expose method 'set'", () => {
        const model = new SqlModelBase<MockSchema>(mockData1, mockSqlOpts);

        expect(model.set).toBeDefined;
        expect(typeof model.set).toBe("function");
    });
});
