
import UserEntity from "./UserEntity";
import {ClassType} from "../../src/repository/MongoRepository/MongoRepository";
import RedisCacheManager from "../../src/cache_manager/RedisCacheManager";
import User from "./User";


export default class UserCacheManager extends RedisCacheManager<User> {
    protected getClass(): ClassType<User> {
        return User;
    }

    protected getCollectionName(): string {
        return 'user';
    }
}
