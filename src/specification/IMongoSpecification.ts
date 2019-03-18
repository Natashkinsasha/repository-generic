import { FilterQuery } from 'mongodb';
import ISpecification from './ISpecification';
import {Entity, Model} from "../repository/MongoRepository";

export default interface IMongoSpecification<E extends Model> extends ISpecification<FilterQuery<Entity<E>>> {}
