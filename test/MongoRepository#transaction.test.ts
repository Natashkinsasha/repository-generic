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


describe('Test UserRepository#transaction', () => {

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


    describe('#{}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(mongoClient, redisClient, {customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),});
        })

        it.skip('1', (done) => {
            const user = createCreateUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then((_id) => {
                    return userRepository
                        .transaction(async (session) => {
                            await userRepository.update(_id, {name: newName}, {session});
                            return userRepository.get(_id, {session});
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
                .then((_id) => {
                    return userRepository
                        .transaction(async (session) => {
                            await userRepository.get(_id, {session})
                            await userRepository.update(_id, {name: faker.name.findName()});
                            await userRepository.update(_id, {name: faker.name.findName()}, {session})
                        });
                })
                .catch(() => {
                    done();
                })
                .catch(done);
        });

    });

});
