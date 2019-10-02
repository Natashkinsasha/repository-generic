import * as chai from "chai";
import * as mongodb from "mongodb";
import * as redis from "redis";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import UserRepository from "./user/UserRepository";
import {createCreateUser} from "./util";
import User from "./user/User";


describe('Test UserRepository#clean', () => {

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

    describe('#{version: true, createdAt: true, lastUpdatedAt: true, validate: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                version: true,
                createdAt: true,
                lastUpdatedAt: true,
                validateAdd: true,
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