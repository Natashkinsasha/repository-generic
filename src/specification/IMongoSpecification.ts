import {FilterQuery} from 'mongodb';
import ISpecification from './ISpecification';
import {Model} from "../repository/IMongoRepository";



export default interface IMongoSpecification<E extends Model> extends ISpecification<FilterQuery<E>> {}
