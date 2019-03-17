import ISpecification from "../specification/ISpecification";


export default abstract class Repository<E, Q, S extends ISpecification<Q>> {
    public abstract create(entity: E): Promise<string>;

    public abstract replace(e: E): Promise<E | void>;

    public abstract update(id: string, o: any): Promise<E | void>;

    public abstract get(id: string): Promise<E | void>;

    public abstract delete(id: string): Promise<boolean>;

    public abstract clean(): Promise<number>;

    public abstract find(
        specification?: S,
        skip?: number,
        limit?: number,
        sort?: Map<string, number>
    ): Promise<ReadonlyArray<E>>;
}
