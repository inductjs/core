import {mockData1, MockSchema, mockSqlOpts} from "./data/fixtures";
import SqlStrategy from "../strategies/sql-strategy";

describe("SQL Strategy", () => {
    it("Model instance should expose method 'findAll'", () => {
        const model = new SqlStrategy<MockSchema>(mockData1, mockSqlOpts);

        expect(model.findAll).toBeDefined;
        expect(typeof model.findAll).toBe("function");
    });

    it("Model instance should expose method 'findOneById'", () => {
        const model = new SqlStrategy<MockSchema>(mockData1, mockSqlOpts);

        expect(model.findOneById).toBeDefined;
        expect(typeof model.findOneById).toBe("function");
    });

    it("Model instance should expose method 'create'", () => {
        const model = new SqlStrategy<MockSchema>(mockData1, mockSqlOpts);

        expect(model.create).toBeDefined;
        expect(typeof model.create).toBe("function");
    });

    it("Model instance should expose method 'update'", () => {
        const model = new SqlStrategy<MockSchema>(mockData1, mockSqlOpts);

        expect(model.update).toBeDefined;
        expect(typeof model.update).toBe("function");
    });

    it("Model instance should expose method 'delete'", () => {
        const model = new SqlStrategy<MockSchema>(mockData1, mockSqlOpts);

        expect(model.delete).toBeDefined;
        expect(typeof model.delete).toBe("function");
    });
});
