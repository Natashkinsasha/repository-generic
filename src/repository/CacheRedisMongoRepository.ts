import {Db, MongoClient} from 'mongodb';
import RedisCacheManager from '../cache_manager/RedisCacheManager';
import { Model } from './IMongoRepository';
import IRepositoryOptions from "./IRepositoryOptions";
import CacheMongoRepository from "./CacheMongoRepository";

export default abstract class CacheRedisMongoRepository<M extends Model, C extends {id: string}> extends CacheMongoRepository<M, C> {
    protected constructor(db: Db, client: MongoClient, redisCacheManage: RedisCacheManager<C>, options: IRepositoryOptions<M, C>) {
        super(db, client, redisCacheManage, options);
    }
}
