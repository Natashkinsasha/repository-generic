import {Condition} from 'mongodb';
import ISpecification from './ISpecification';
import {Entity, Model} from "../repository/IMongoRepository";

export type FilterQuery<T> = {
    [P in keyof T]?: T[P] | Condition<T, P>;
};

export default interface IMongoSpecification<E extends Model> extends ISpecification<FilterQuery<Entity<E>>> {}
