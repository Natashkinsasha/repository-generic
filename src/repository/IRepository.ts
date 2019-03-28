import ISpecification from "../specification/ISpecification";


export default interface IRepository<E, Q, S extends ISpecification<Q>> {
    add(entity: any): Promise<string>;

    update(id: string, entity: any): Promise<E | void>;

    get(id: string): Promise<E | void>;

    delete(id: string): Promise<boolean>;

    clean(): Promise<number>;

    find(
        specification?: S,
        skip?: number,
        limit?: number,
        sort?: Map<string, number>
    ): Promise<ReadonlyArray<E>>;
}
