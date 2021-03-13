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

export type ErrReturn<T> = [T | null, Error | null]
