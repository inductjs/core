export type GenericMap<T> = {
    [k: string]: keyof T;
}

export type StringMap = {
	[k: string]: string;
}

export type SubType<Base, Condition> = Pick<
    Base,
    {
        [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
    }[keyof Base]
>;

export type PromiseErrReturn<T> = Promise<ErrorEither<T>>

export type Either<T, U> = T | U
export type EitherTuple<T, U> = [T | null, U | null]
export type ErrorEither<T> = EitherTuple<T, Error>
export type PErrorEither<T> = Promise<ErrorEither<T>>

