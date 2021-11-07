import * as mongodb from "mongodb";
import * as redis from 'redis-mock';
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
import { MongoMemoryServer } from 'mongodb-memory-server';


describe('Test UserRepository#find', () => {

    const {expect} = chai;

    let mongoMemoryServer: MongoMemoryServer;
    let db: mongodb.Db;
    let mongoClient: mongodb.MongoClient;
    let redisClient: redis.RedisClient;


    before(async () => {
        mongoMemoryServer = await MongoMemoryServer.create();
        const mongodbUri = mongoMemoryServer.getUri();
        mongoClient = await mongodb.MongoClient.connect(mongodbUri)
            .then((client: mongodb.MongoClient) => {
                db = client.db("test");
                return client;
            });
        redisClient = redis.createClient("redis://localhost:6379");
    });

    after(async () => {
        await mongoClient.close();
        await mongoMemoryServer.stop();
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
                    return userRepository.delete(new ObjectId(users[0]._id));
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
                    return userRepository.find(new NameUserSpecification(name), 1, 1, {sort: {name: 1}});
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
