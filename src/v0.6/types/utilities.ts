export type Constructor<T> = new (...any: any[]) => T;

/** Mark types that do not match the condition type (2nd parameter) as 'never' */
export type SubType<Base, Condition> = Pick<
    Base,
    {
        [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
    }[keyof Base]
>;
