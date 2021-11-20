import { Db, MongoClient } from 'mongodb';
import RedisCacheManager from '../cache_manager/RedisCacheManager';
import IRepositoryOptions from './IRepositoryOptions';
import { Model } from './IMongoRepository';
import CacheMongoRepository from './CacheMongoRepository';

export default abstract class CacheRedisMongoRepository<M extends Model, C> extends CacheMongoRepository<M, C> {
    protected constructor(client: MongoClient, redisCacheManage: RedisCacheManager<C>, options: IRepositoryOptions<M, C>) {
        super(client, redisCacheManage, options);
    }
}
