import {Db, MongoClient} from 'mongodb';
import { RedisClient } from 'redis';
import CacheRedisMongoRepository from "../../src/repository/CacheRedisMongoRepository";
import User from "./User";
import UserCacheManager from "./UserCacheManager";
import {ClassType} from "../../src";
import IRepositoryOptions from "../../src/repository/IRepositoryOptions";

export default class UserRepository extends CacheRedisMongoRepository<User> {
    constructor(db: Db, client: MongoClient, redisClient: RedisClient, options?: Partial<IRepositoryOptions>) {
        super(db, client, new UserCacheManager(redisClient), options);
    }

    protected getClass(): ClassType<User> {
        return User;
    }
}
