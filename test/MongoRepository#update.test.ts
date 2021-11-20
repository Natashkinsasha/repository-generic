import * as mongodb from "mongodb";
import * as redis from 'redis-mock';
import * as chai from "chai";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import UserEntity from "./user/UserEntity";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import {plainToClass} from "class-transformer";
import User from "./user/User";
import { MongoMemoryServer } from 'mongodb-memory-server';


describe('Test UserRepository#update', () => {

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


    describe('#{version: true, createdAt: true, lastUpdatedAt: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(mongoClient, redisClient, {customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),});
        });

        it('1', (done) => {
            const user = createCreateUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then((_id) => {
                    return userRepository.update(_id, {name: newName});
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, name: newName, version: 1});
                    done();
                })
                .catch(done);
        });

    });


    describe('#{version: true, createdAt: true, lastUpdatedAt: true, softDelete: true, validateUpdate: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(mongoClient, redisClient, {
                validateUpdate: true,
                customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),
            });
        });

        it('1', (done) => {
            const user = createCreateUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then(async (_id) => {
                    await userRepository.delete(_id);
                    return userRepository.update(_id, {name: newName});
                })
                .then((newUser: User) => {
                    expect(newUser).to.be.a('undefined');
                    done();
                })
                .catch(done);
        });

        it('2', () => {
            const user = createCreateUser({});
            return userRepository
                .add(user)
                .then(async (_id) => {
                    expect(userRepository.update(_id, {name: null} as any)).rejectedWith();
                });
        });



    });

});
