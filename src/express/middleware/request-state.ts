export class Store<T> {
    private _items: T[]

    constructor() {

    };
    
    get items() {
        return this._items;
    }
    set items(val: T[]) {
        this._items = val;
    }

    get size() {
        return this.items.length;
    }

    add<K extends keyof T>(key: K, val: T[K]): void {

    }
}


interface RequestState {

}