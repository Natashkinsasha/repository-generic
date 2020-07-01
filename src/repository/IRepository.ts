import ISpecification from "../specification/ISpecification";
import { ObjectId } from "mongodb";


export default interface IRepository<E, I, K, R, Q, S extends ISpecification<Q>> {
    add(entity: K): Promise<ObjectId>;

    get(id: I): Promise<E | void>;

    delete(id: I): Promise<boolean>;

    clean(): Promise<number>;

    update(id: I, entity: R): Promise<E | void>;

    find(
        specification?: S,
        skip?: number,
        limit?: number,
        sort?: Map<string, number>
    ): Promise<ReadonlyArray<E>>;
}
