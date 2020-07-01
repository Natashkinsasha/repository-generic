import * as chai from "chai";
import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chaiAsPromised from "chai-as-promised";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import User from "./user/User";
import NameUserSpecification from "./user/NameUserSpecification";
import * as faker from "faker";
import RepositoryValidationError from "../src/error/RepositoryValidationError";


describe('Test UserRepository#clean', () => {
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

    describe('#{validateUpdate: true}', () => {

        let userRepository: UserRepository;
        before(() => {
            userRepository = new UserRepository(db, mongoClient, redisClient, {
                validateUpdate: true,
            });
        });

        it('1', (done) => {
            const user = createCreateUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then(() => {
                    return userRepository.findOneAndUpdate(new NameUserSpecification(user.name), {name: newName});
                })
                .then((newUser: User)=>{
                    validateUser(newUser, {...user, name: newName, version: 1});
                    done();
                })
                .catch(done);
        });
    });
});
