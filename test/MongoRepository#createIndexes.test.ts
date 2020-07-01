import * as mongodb from "mongodb";
import * as redis from "redis";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import UserRepository from "./user/UserRepository";


describe('Test UserRepository#clean', () => {

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

    describe('#{validateAdd: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
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
