import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import User from "./user/User";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import Purchase from "./user/Purchase";
import NameUserSpecification from "./user/NameUserSpecification";
import RepositoryValidationError from "../src/error/RepositoryValidationError";


describe('Test UserRepository#get', () => {
    chai.use(chaiAsPromised);
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


    describe('#{}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient);
        })

        it('1', (done) => {
            const user = createCreateUser({purchase: [{createdAt:new Date()}]});
            userRepository
                .add(user)
                .then((id) => {
                    return userRepository.get(id);
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, version: 0});
                    return userRepository.get(newUser._id);
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, version: 0});
                    done();
                })
                .catch(done);
        });

    });

});
