import * as mongodb from "mongodb";
import * as redis from 'redis-mock';
import MongoDbHelper from "../src/helper/MongoDbHelper";
import UserRepository from "./user/UserRepository";
import UserEntity from "./user/UserEntity";
import {plainToClass} from "class-transformer";
import User from "./user/User";
import { MongoMemoryServer } from 'mongodb-memory-server';


describe('Test UserRepository#clean', () => {

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

    describe('#{validateAdd: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(mongoClient, redisClient, {
                validateAdd: true,
                customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),
            });
        });

        it('1', (done) => {
            userRepository
                .createIndexes([{
                    key: {
                        name: 1
                    }
                }])
                .then(() => {
                    done();
                })
                .catch(done);
        });

    })

});
