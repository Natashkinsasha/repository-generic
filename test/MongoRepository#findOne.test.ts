import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import UserEntity from "./user/UserEntity";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import Purchase from "./user/Purchase";
import NameUserSpecification from "./user/NameUserSpecification";
import {plainToClass} from "class-transformer";
import User from "./user/User";


describe('Test UserRepository#findOne', () => {

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


    describe('#{validateGet: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                validateGet: true,
                customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),
            });
        });

        it('1', (done) => {
            const name = faker.name.findName();
            const user = createCreateUser({name});
            userRepository
                .add(user)
                .then(() => {
                    return userRepository.findOne(new NameUserSpecification(name));
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, version: 0});
                    done();
                })
                .catch(done);
        });

        it('2', (done) => {
            const name = faker.name.findName();
            const user = createCreateUser({name});
            userRepository
                .add(user)
                .then(async (_id) => {
                    await userRepository.delete(_id);
                    return userRepository.findOne(new NameUserSpecification(name));
                })
                .then((newUser: User | void) => {
                    expect(newUser).to.be.a('undefined');
                    done();
                })
                .catch(done);
        });
    });


    describe('#{validateGet: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                validateGet: true,
                customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),
            });
        });

        it('1', (done) => {
            const name = faker.name.findName();
            const user = createCreateUser({name});
            userRepository
                .add(user)
                .then(() => {
                    return userRepository.findOne(new NameUserSpecification(name));
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, version: 0});
                    done();
                })
                .catch(done);
        });

        it('2', (done) => {
            const name = faker.name.findName();
            const user = createCreateUser({name});
            userRepository
                .add(user)
                .then(async (id) => {
                    await userRepository.delete(id);
                    return userRepository.findOne(new NameUserSpecification(name));
                })
                .then((newUser: User | void) => {
                    expect(newUser).to.be.a('undefined');
                    done();
                })
                .catch(done);
        });
    });

});
