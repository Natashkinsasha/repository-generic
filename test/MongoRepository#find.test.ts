import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import User from "./user/User";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import Purchase from "./user/Purchase";
import NameUserSpecification from "./user/NameUserSpecification";


describe('Test UserRepository#find', () => {

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

        let userRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                version: true,
                createdAt: true,
                lastUpdatedAt: true
            });
        })

        it('1', (done) => {
            Promise
                .all([
                    userRepository.add(createCreateUser({})),
                    userRepository.add(createCreateUser({})),
                ])
                .then(() => {
                    return userRepository.find();
                })
                .then((users: User[]) => {
                    expect(users).to.have.lengthOf(2);
                    return userRepository.delete(users[0].id);
                })
                .then(() => {
                    return userRepository.find();
                })
                .then((users: User[]) => {
                    expect(users).to.have.lengthOf(1);
                    done();
                })
                .catch(done);
        });

        it('2', (done) => {
            const name = faker.name.findName();
            Promise
                .all([
                    userRepository.add(createCreateUser({name})),
                    userRepository.add(createCreateUser({})),
                ])
                .then(() => {
                    return userRepository.find(new NameUserSpecification(name));
                })
                .then((users: User[]) => {
                    expect(users).to.have.lengthOf(1);
                    validateUser(users[0], {name});
                    done();
                })
                .catch(done);
        });

    });


    describe('#{version: true, createdAt: true, lastUpdatedAt: true, softDelete: true}', () => {

        let userRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                version: true,
                createdAt: true,
                lastUpdatedAt: true,
                softDelete: true,
            });
        })

        it('1', (done) => {
            Promise
                .all([
                    userRepository.add(createCreateUser({})),
                    userRepository.add(createCreateUser({})),
                ])
                .then(() => {
                    return userRepository.find();
                })
                .then((users: User[]) => {
                    expect(users).to.have.lengthOf(2);
                    return userRepository.delete(users[0].id);
                })
                .then(() => {
                    return userRepository.find();
                })
                .then((users: User[]) => {
                    expect(users).to.have.lengthOf(1);
                    done();
                })
                .catch(done);
        });

    });


});