import * as mongodb from "mongodb";
import * as redis from 'redis-mock';
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import UserEntity from "./user/UserEntity";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import User from "./user/User";
import {plainToClass} from "class-transformer";
import { MongoMemoryServer } from 'mongodb-memory-server';


describe('Test UserRepository#get', () => {
    chai.use(chaiAsPromised);
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
            userRepository = new UserRepository(mongoClient, redisClient, {customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity)});
        })

        it('1', (done) => {
            const user = createCreateUser({purchase: [{createdAt:new Date()}]});
            userRepository
                .add(user)
                .then((_id) => {
                    console.log({_id});
                    return userRepository.get(_id);
                })
                .then((newUser: User) => {
                    console.log({newUser});
                    validateUser(newUser, {...user, version: 0});
                    return userRepository.get(newUser._id);
                })
                .then((newUser: User) => {
                    console.log({newUser});
                    validateUser(newUser, {...user, version: 0});
                    done();
                })
                .catch(done);
        });

    });

});
