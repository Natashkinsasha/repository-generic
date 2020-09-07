import { Db, MongoClient } from 'mongodb';
import { CacheMongoRepository, IRepositoryOptions, Model, RedisCacheManager } from '../index';

export default abstract class CacheRedisMongoRepository<M extends Model, C extends {id: string}> extends CacheMongoRepository<M, C> {
    protected constructor(db: Db, client: MongoClient, redisCacheManage: RedisCacheManager<C>, options: IRepositoryOptions<M, C>) {
        super(db, client, redisCacheManage, options);
    }
}
