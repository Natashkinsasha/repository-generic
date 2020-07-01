import {Db, MongoClient} from 'mongodb';
import { RedisClient } from 'redis';
import CacheRedisMongoRepository from "../../src/repository/CacheRedisMongoRepository";
import UserEntity from "./UserEntity";
import UserCacheManager from "./UserCacheManager";
import {ClassType} from "../../src";
import IRepositoryOptions from "../../src/repository/IRepositoryOptions";
import User from "./User";

export default class UserRepository extends CacheRedisMongoRepository<UserEntity, User> {
    constructor(db: Db, client: MongoClient, redisClient: RedisClient, options: IRepositoryOptions<UserEntity, User>) {
        super(db, client, new UserCacheManager(redisClient), options);
    }

    protected getClass(): ClassType<UserEntity> {
        return UserEntity;
    }
}
