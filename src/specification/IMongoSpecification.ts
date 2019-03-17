import { FilterQuery } from 'mongodb';
import ISpecification from './ISpecification';

export default interface IMongoSpecification<E> extends ISpecification<FilterQuery<E>> {}
