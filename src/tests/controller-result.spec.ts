import {HttpStatusCode} from "azure-functions-ts-essentials";
import ControllerResult from "../express/controller-result";
import {mockResponse, TestError} from "./data/mocks";

const mockResult1 = {
    status: HttpStatusCode.OK,
    res: mockResponse(),
    info: "Hallo",
    data: {
        hallo: "test",
    },
};

const mockResult2 = {
    status: HttpStatusCode.InternalServerError,
    res: mockResponse(),
    error: new TestError("Oepsie"),
};

describe("controller-result", () => {
    it("should expose method 'send'", () => {
        const cr = new ControllerResult(mockResult1);

        expect(cr.send).toBeDefined;
        expect(typeof cr.send).toBe("function");
    });

    it("should expose method 'redirect'", () => {
        const cr = new ControllerResult(mockResult1);

        expect(cr.redirect).toBeDefined;
        expect(typeof cr.redirect).toBe("function");
    });

    it("send should use the correct paramaters", () => {
        const res = mockResponse();
        mockResult1.res = res;

        new ControllerResult(mockResult1).send();

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
        expect(res.json).toHaveBeenCalledWith({
            data: mockResult1.data,
            info: mockResult1.info,
            error: undefined,
            validationErrors: undefined,
        });
    });

    it("should only return the error's name if debug mode is not toggled", () => {
        const res = mockResponse();
        mockResult2.res = res;

        new ControllerResult(mockResult2).send();

        expect(res.status).toHaveBeenCalledWith(
            HttpStatusCode.InternalServerError
        );
        expect(res.json).toHaveBeenCalledWith({
            data: undefined,
            info: undefined,
            error: mockResult2.error.name,
            validationErrors: undefined,
        });
    });

    it("enabling debug mode should return the full error message in the error property", () => {
        const res = mockResponse();
        mockResult2.res = res;

        new ControllerResult(mockResult2, {debug: true}).send();

        expect(res.status).toHaveBeenCalledWith(
            HttpStatusCode.InternalServerError
        );
        expect(res.json).toHaveBeenCalledWith({
            data: undefined,
            info: undefined,
            error: mockResult2.error.message,
            validationErrors: undefined,
        });
    });

    it("redirect should call res.redirect with the given location", () => {
        const res = mockResponse();
        mockResult1.res = res;

        new ControllerResult(mockResult1).redirect("tst");

        expect(res.redirect).toHaveBeenCalledWith("tst");
    });
});
