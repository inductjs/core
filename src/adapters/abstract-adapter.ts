import {ValidationError} from "class-validator";

export abstract class InductAdapter<T> {
    protected data: T;

    constructor() {
        this.findAll = this.findAll.bind(this);
        this.findOneById = this.findOneById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.get = this.get.bind(this);
        this.set = this.set.bind(this);
        this.exists = this.exists.bind(this);
    }

    /* istanbul ignore next */
    public get<K extends keyof T>(prop: K): T[K] {
        return this.data[prop];
    }

    /* istanbul ignore next */
    public set<K extends keyof T>(prop: K, value: T[K]): void {
        this.data[prop] = value;
    }

    /* istanbul ignore next */
    public abstract exists<K extends keyof T>(
        column: K,
        value: T[K]
    ): Promise<boolean>;

    public abstract async findAll(): Promise<T[]>;

    public abstract async findOneById(lookup?: T[keyof T]): Promise<T[]>;

    public abstract async create(value?: Partial<T>): Promise<T>;

    public abstract async update(value?: Partial<T>): Promise<number>;

    public abstract async delete(lookup?: T[keyof T]): Promise<any>;

    public abstract async validate(): Promise<ValidationError[]>;
}

export default InductAdapter;
