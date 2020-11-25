import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import UserEntity from "./user/UserEntity";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import {plainToClass} from "class-transformer";
import User from "./user/User";


describe('Test UserRepository#transaction', () => {

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

        it.skip('1', (done) => {
            const user = createCreateUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then((entity) => {
                    return userRepository
                        .transaction(async (session) => {
                            await userRepository.update(entity._id, {name: newName}, {session});
                            return userRepository.get(entity._id, {session});
                        });
                })
                .then((newUser: User) => {
                    expect(newUser).to.be.a('object');
                    newUser && validateUser(newUser, {...user, name: newName, version: 1});
                    done();
                })
                .catch(done);
        });

        it('2', (done) => {
            const user = createCreateUser({});
            userRepository
                .add(user)
                .then((entity) => {
                    return userRepository
                        .transaction(async (session) => {
                            await userRepository.get(entity._id, {session})
                            await userRepository.update(entity._id, {name: faker.name.findName()});
                            await userRepository.update(entity._id, {name: faker.name.findName()}, {session})
                        });
                })
                .catch(() => {
                    done();
                })
                .catch(done);
        });

    });

});
