export default interface ICacheManager<T> {
    get(id: string);

    save(object: T);

    delete(id: string);

    deleteAll();
}
