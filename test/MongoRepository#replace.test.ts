import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import User from "./user/User";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import {MongoError} from "mongodb";
import RepositoryValidationError from "../src/error/RepositoryValidationError";


describe('Test UserRepository#replace', () => {
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


    describe('#{validateReplace: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                validateReplace: true,
            });
        });

        it('1', (done) => {
            const user = createCreateUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then((id) => {
                    return userRepository.get(id);
                })
                .then((user: User) => {
                    return userRepository.replace({...user, name: newName});
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
                .then((id) => {
                    return userRepository.get(id);
                })
                .then((user: User) => {
                    return expect(userRepository.replace({...user, name: newName})).to.be.rejectedWith(RepositoryValidationError);
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
                .then((id) => {
                    return userRepository.get(id);
                })
                .then(async (user: User) => {
                    await userRepository.delete(user._id);
                    return userRepository.replace({...user, name: newName});
                })
                .then((newUser: User) => {
                    expect(newUser).to.be.a('undefined');
                    done();
                })
                .catch(done);
        });
    });

});
