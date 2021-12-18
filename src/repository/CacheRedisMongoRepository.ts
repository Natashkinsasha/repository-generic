import { MongoClient } from 'mongodb';
import RedisCacheManager from '../cache_manager/RedisCacheManager';
import IRepositoryOptions from './IRepositoryOptions';
import { Model } from './IMongoRepository';
import CacheMongoRepository from './CacheMongoRepository';
import { ClassType } from '../util';


function createCacheRedisMongoRepository<M extends Model, C>(clazz: ClassType<M>) {
    return class extends CacheMongoRepository<M, C>(clazz) {
        protected constructor(client: MongoClient, redisCacheManage: RedisCacheManager<C>, options: IRepositoryOptions<M, C>) {
            super(client, redisCacheManage, options);
        }
    };
}


export default <M extends Model, C>(clazz: ClassType<M>) => {
    return createCacheRedisMongoRepository<M, C>(clazz);
};
