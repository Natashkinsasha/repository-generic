import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import UserEntity from "./user/UserEntity";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import {plainToClass} from "class-transformer";
import User from "./user/User";
import { ObjectId } from "mongodb";


describe('Test UserRepository#delete', () => {

    const {expect} = chai;

    let db: mongodb.Db;
    let mongoClient: mongodb.MongoClient;
    let redisClient: redis.RedisClient;


    before(async () => {
        mongoClient = await mongodb.MongoClient.connect("mongodb://localhost:27017")
            .then((client: mongodb.MongoClient) => {
                db = client.db("test");
                return client;
            });
        redisClient = redis.createClient("redis://localhost:6379");
    });

    after(async () => {
        await mongoClient.close();
        redisClient.end(true);
    });


    beforeEach(async () => {
        await MongoDbHelper.dropAll(db);
    });


    describe('#{}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),});
        })

        it('1', (done) => {
            const user = createCreateUser({});
            userRepository
                .add(user)
                .then((_id) => {
                    return userRepository.get(_id);
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, version: 0});
                    return userRepository.delete(new ObjectId(newUser.id))
                        .then(() => {
                            // validateUser(deletedUser, { ...user, version: 0 });
                            return userRepository.get(new ObjectId(newUser.id));
                        });
                })
                .then((user: User | void) => {
                    expect(user).to.be.a('undefined');
                    done();
                })
                .catch(done);
        });

    });
});
