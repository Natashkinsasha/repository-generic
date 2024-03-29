import { Filter } from 'mongodb';
import { Model } from '../repository/IMongoRepository';
import ISpecification from './ISpecification';


export default interface IMongoSpecification<E extends Model> extends ISpecification<Filter<E>> {}
