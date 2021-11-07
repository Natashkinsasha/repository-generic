import * as mongodb from "mongodb";
import * as redis from 'redis-mock';
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import UserEntity from "./user/UserEntity";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import RepositoryValidationError from "../src/error/RepositoryValidationError";
import User from "./user/User";
import {plainToClass} from "class-transformer";
import { MongoMemoryServer } from 'mongodb-memory-server';


describe('Test UserRepository#replace', () => {
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


    describe('#{validateReplace: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                validateReplace: true,
                customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity),
            });
        });

        it('1', (done) => {
            const user = createCreateUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then((_id) => {
                    return userRepository.get(_id);
                })
                .then((user: User) => {
                    const {_id, ...uUser} = user;
                    return userRepository.replace({_id, ...uUser, name: newName});
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, name: newName, version: 1});
                    done();
                })
                .catch(done);
        });

        it('2', (done) => {
            const user = createCreateUser({});
            const newName: any = 1;
            userRepository
                .add(user)
                .then((_id) => {
                    return userRepository.get(_id);
                })
                .then((user: User) => {
                    const {_id, ...uUser} = user;
                    return expect(userRepository.replace({_id, ...uUser, name: newName})).to.be.rejectedWith(RepositoryValidationError);
                })
                .then(() => {
                    done();
                })
                .catch(done);
        });

        it('3', (done) => {
            const user = createCreateUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then((_id) => {
                    return userRepository.get(_id);
                })
                .then(async (user: User) => {
                    await userRepository.delete(user._id);
                    const {_id, ...uUser} = user;
                    return userRepository.replace({_id, ...uUser, name: newName});
                })
                .then((newUser?: User) => {
                    expect(newUser).to.be.a('undefined');
                    done();
                })
                .catch(done);
        });
    });

});
