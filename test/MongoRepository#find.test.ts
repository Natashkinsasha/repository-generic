import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import UserEntity from "./user/UserEntity";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import NameUserSpecification from "./user/NameUserSpecification";
import {plainToClass} from "class-transformer";
import User from "./user/User";
import { ObjectId } from "mongodb";


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


    describe('#{validateGet: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                validateGet: true,
                customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),
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
                    return userRepository.delete(new ObjectId(users[0].id));
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

        it('3', (done) => {
            const name = faker.name.findName();
            Promise
                .all([
                    userRepository.add(createCreateUser({name})),
                    userRepository.add(createCreateUser({name})),
                    userRepository.add(createCreateUser({})),
                ])
                .then(() => {
                    const sort = new Map<string, number>().set(name, 1);
                    return userRepository.find(new NameUserSpecification(name), 1, 1, sort);
                })
                .then((users: User[]) => {
                    expect(users).to.have.lengthOf(1);
                    validateUser(users[0], {name});
                    done();
                })
                .catch(done);
        });

        it('4', (done) => {
            const name = faker.name.findName();
            Promise
                .all([
                    userRepository.add(createCreateUser({name})),
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
});
