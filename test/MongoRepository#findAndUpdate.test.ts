import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import UserRepository from "./user/UserRepository";
import {createCreateUser} from "./util";
import User from "./user/User";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import NameUserSpecification from "./user/NameUserSpecification";
import RepositoryValidationError from "../src/error/RepositoryValidationError";


describe('Test UserRepository#findAndUpdate', () => {
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
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                validateUpdate: true,
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
                .then((user: User | void) => {
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
