import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import * as chaiAsPromised from 'chai-as-promised';
import UserRepository from "./user/UserRepository";
import {createCreateUser} from "./util";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import RepositoryValidationError from "../src/error/RepositoryValidationError";


describe('Test UserRepository#add', () => {

    const {expect} = chai;
    chai.use(chaiAsPromised);

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
            const user = createCreateUser({});
            userRepository
                .add(user)
                .then((id: string) => {
                    expect(id).to.be.a('string');
                    done();
                })
                .catch(done);
        });

        it('2', () => {
            const user: any = {};
            return expect(userRepository.add(user)).to.be.rejectedWith(RepositoryValidationError);
        });

    });


    describe('#{version: true, createdAt: true, lastUpdatedAt: true, softDelete: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                version: true,
                createdAt: true,
                lastUpdatedAt: true,
                softDelete: true,
            });
        })

        it('1', (done) => {
            const user = createCreateUser({});
            userRepository
                .add(user)
                .then((id: string) => {
                    expect(id).to.be.a('string');
                    done();
                })
                .catch(done);
        });

    });


});