import {FindOneOptions, ObjectId, SortOptionObject} from 'mongodb';
import { ISpecification } from '../index';


export default interface IRepository<E, I, K, R, Q, S extends ISpecification<Q>> {
    add(entity: K): Promise<ObjectId>;

    get(id: I): Promise<E | void>;

    delete(id: I): Promise<boolean>;

    clean(): Promise<number>;

    update(id: I, entity: R): Promise<E | void>;
}
