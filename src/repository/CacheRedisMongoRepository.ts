import {CommonOptions, Db, FindOneAndUpdateOption, FindOneOptions, MongoClient} from 'mongodb';
import RedisCacheManager from '../cache_manager/RedisCacheManager';
import { Model, UpdateModel } from './IMongoRepository';
import MongoRepository from "./MongoRepository/MongoRepository";
import IRepositoryOptions from "./IRepositoryOptions";
import CacheMongoRepository from "./CacheMongoRepository";

export default abstract class CacheRedisMongoRepository<M extends { id: string }> extends CacheMongoRepository<M> {
    protected constructor(db: Db, client: MongoClient, redisCacheManage: RedisCacheManager<M>, options?: Partial<IRepositoryOptions>) {
        super(db, client, redisCacheManage, options);
    }
}
