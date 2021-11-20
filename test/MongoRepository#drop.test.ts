import * as chai from "chai";
import * as mongodb from "mongodb";
import * as redis from 'redis-mock';
import * as chaiAsPromised from "chai-as-promised";
import {MongoError} from "mongodb";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import UserRepository from "./user/UserRepository";
import {createCreateUser} from "./util";
import UserEntity from "./user/UserEntity";
import {plainToClass} from "class-transformer";
import User from "./user/User";
import { MongoMemoryServer } from 'mongodb-memory-server';


describe('Test UserRepository#clean', () => {
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

    describe('#{validateAdd: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(mongoClient, redisClient, {
                validateAdd: true,
                customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),
            });
        });

        it('1', (done) => {
            const user = createCreateUser({});
            userRepository
                .add(user)
                .then(() => {
                    return userRepository.drop();
                })
                .then(()=>{
                    return userRepository.find();
                })
                .then(()=>{
                    done();
                })
                .catch(done);
        });

        it('2', () => {
            return expect(userRepository.drop()).to.be.rejectedWith(MongoError);
        });
    });


});
