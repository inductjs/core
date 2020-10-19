export abstract class Strategy<T> {
    constructor() {
        this.findAll = this.findAll.bind(this);
        this.findOneById = this.findOneById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.validate = this.validate.bind(this);
        this.exists = this.exists.bind(this);
    }

    public abstract async findAll(): Promise<T[]>;
    public abstract async findOneById(lookup?: T[keyof T]): Promise<T | T[]>;
    public abstract async create(value?: Partial<T>):Promise<T>;
    public abstract async update(value?: Partial<T>) :Promise<T | number>;
    public abstract async delete(lookup?: T[keyof T]): Promise<any>;
    public abstract async validate(value?: T): Promise<any>;
    public abstract async exists<K extends keyof T>(
        field: K,
        value: T[K]
    ): Promise<boolean>;
}