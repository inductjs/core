import {DTOConstructor} from "./types/constructors";
import {ValidationError, Validator as CValidator} from "class-validator";

export type DTO<T> = {
    [K in keyof T]?: T[K];
} &
    HasValidation;

type HasValidation = {
    validate: () => Promise<ValidationError[]>;
};

export class Validator<T> {
    dto: CValidator;
    data: Partial<T>;

    constructor(dto: DTOConstructor<T>, data: Partial<T>) {
        this.dto = new dto(data);
        this.data = data;
    }

    validate(): Promise<ValidationError[]> {
        return this.dto.validate(this.data);
    }

    dtoData(): Partial<T> {
        const keys = [this.data, this.dto]
            .map((o) => Object.keys(o))
            .sort((a, b) => a.length - b.length)
            .reduce((a, b) => a.filter((key) => b.includes(key)));

        const data = {};

        keys.forEach((key) => (data[key] = this.data[key]));

        return data;
    }
}
