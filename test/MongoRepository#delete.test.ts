import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import User from "./user/User";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import Purchase from "./user/Purchase";


describe('Test UserRepository#add', () => {

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


    describe('#{version: true, createdAt: true, lastUpdatedAt: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                version: true,
                createdAt: true,
                lastUpdatedAt: true
            });
        })

        it('1', (done) => {
            const user = createCreateUser({});
            userRepository
                .add(user)
                .then((id: string) => {
                    return userRepository.get(id);
                })
                .then((newUser: User) => {

                    validateUser(newUser, {...user, version: 0});
                    return userRepository.delete(newUser.id)
                        .then(() => {
                            // validateUser(deletedUser, { ...user, version: 0 });
                            return userRepository.get(newUser.id);
                        });
                })
                .then((user: User | void) => {
                    expect(user).to.be.a('undefined');
                    done();
                })
                .catch(done);
        });

    });


    describe('#{version: true, createdAt: true, lastUpdatedAt: true, softDelete: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                version: true,
                createdAt: true,
                lastUpdatedAt: true,
                softDelete: true,
            });
        })

        it('1', (done) => {
            const user = createCreateUser({});
            userRepository
                .add(user)
                .then((id: string) => {
                    return userRepository.get(id);
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, version: 0});
                    return userRepository.delete(newUser.id)
                        .then(() => {
                            // validateUser(deletedUser, { ...user, version: 0 });
                            return userRepository.get(newUser.id);
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