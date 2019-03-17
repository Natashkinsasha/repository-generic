
import User from "./User";
import {ClassType} from "../../src/repository/MongoRepository";
import RedisCacheManager from "../../src/cache_manager/RedisCacheManager";


export default class UserCacheManager extends RedisCacheManager<User> {
    protected getClass(): ClassType<User> {
        return User;
    }

    protected getCollectionName(): string {
        return 'user';
    }
}
