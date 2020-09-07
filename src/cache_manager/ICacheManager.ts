export default interface ICacheManager<T> {
    get(id: string): Promise<T | void>;

    save(object: T): Promise<T>;

    delete(id: string): Promise<void>;

    deleteAll(): Promise<void>;

}
