import { Db } from 'mongodb';
import { RedisClient } from 'redis';
import CacheRedisMongoRepository from "../../src/repository/CacheRedisMongoRepository";
import User from "./User";
import UserCacheManager from "./UserCacheManager";
import {ClassType} from "../../src/repository/MongoRepository";

export default class UserRepository extends CacheRedisMongoRepository<User> {
    constructor(db: Db, redisClient: RedisClient) {
        super(db, new UserCacheManager(redisClient));
    }

    protected getClass(): ClassType<User> {
        return User;
    }
}
