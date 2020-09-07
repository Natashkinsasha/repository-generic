import { FilterQuery } from 'mongodb';
import {ISpecification, Model} from '..';


export default interface IMongoSpecification<E extends Model> extends ISpecification<FilterQuery<E>> {}
