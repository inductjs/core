import {Validator} from "class-validator";

export type AnyConstructor = new (...args: any[]) => any;
export type Constructor<T> = new (...args: any[]) => T;
export type DTOConstructor<T> = new (data: Partial<T>) => Validator;
