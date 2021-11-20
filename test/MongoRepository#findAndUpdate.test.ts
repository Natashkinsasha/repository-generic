import * as mongodb from "mongodb";
import * as redis from 'redis-mock';
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import UserRepository from "./user/UserRepository";
import {createCreateUser} from "./util";
import UserEntity from "./user/UserEntity";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import NameUserSpecification from "./user/NameUserSpecification";
import RepositoryValidationError from "../src/error/RepositoryValidationError";
import {plainToClass} from "class-transformer";
import User from "./user/User";
import { MongoMemoryServer } from 'mongodb-memory-server';


describe('Test UserRepository#findAndUpdate', () => {
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
            userRepository = new UserRepository(mongoClient, redisClient, {customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),});
        })

        it('1', (done) => {
            const name = faker.name.findName();
            const user = createCreateUser({name});
            userRepository
                .add(user)
                .then(() => {
                    return userRepository.findAndUpdate(new NameUserSpecification(name), {name: faker.name.findName()});
                })
                .then(() => {
                    done();
                })
                .catch(done);
        });

    });

    describe('#{validateUpdate: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(mongoClient, redisClient, {
                validateUpdate: true,
                customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),
            });
        });

        it('1', (done) => {
            const name = faker.name.findName();
            const user = createCreateUser({name});
            userRepository
                .add(user)
                .then(async (_id) => {
                    await userRepository.delete(_id);
                    return userRepository.findAndUpdate(new NameUserSpecification(name), {name: faker.name.findName()});
                })
                .then((user: UserEntity | void) => {
                    expect(user).to.be.a('undefined');
                    done();
                })
                .catch(done);
        });

        it('2', (done) => {
            const name = faker.name.findName();
            const user = createCreateUser({name});
            userRepository
                .add(user)
                .then(async () => {
                    const newUser: any = {name: 1};
                    return expect(userRepository.findAndUpdate(new NameUserSpecification(name), newUser)).to.be.rejectedWith(RepositoryValidationError);
                })
                .then(() => {
                    done();
                })
                .catch(done);
        });

    });

});
