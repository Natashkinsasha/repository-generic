import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import UserRepository from "./user/UserRepository";
import {createUser, validateUser} from "./util";
import User from "./user/User";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import NameUserSpecification from "./user/NameUserSpecification";


describe('Test UserRepository', () => {

    const { expect } = chai;

    let db: mongodb.Db;
    let mongoClient: mongodb.MongoClient;
    let userRepository: UserRepository;
    let redisClient: redis.RedisClient;


    before(async () => {
        mongoClient = await mongodb.MongoClient.connect("mongodb://localhost:27017")
            .then((client: mongodb.MongoClient)=>{
                db = client.db("test");
                return client;
            });
        redisClient = redis.createClient("redis://localhost:6379");
        userRepository = new UserRepository(db, redisClient);
    });

    after(async () => {
        await mongoClient.close();
        redisClient.end(true);
    });


    beforeEach(async () => {
        await MongoDbHelper.dropAll(db);
    });


    describe('#add', () => {

        it('1', (done) => {
            const user = createUser({});
            userRepository
                .add(user)
                .then((id: string) => {
                    expect(id).to.be.a('string');
                    done();
                })
                .catch(done);
        });

    });


    describe('#get', () => {

        it('1', (done) => {
            const user = createUser({});
            userRepository
                .add(user)
                .then((id: string) => {
                    return userRepository.get(id);
                })
                .then((newUser: User) => {
                    validateUser(newUser, { ...user, version: 0 });
                    return userRepository.get(newUser.id);
                })
                .then((newUser: User) => {
                    validateUser(newUser, { ...user, version: 0 });
                    done();
                })
                .catch(done);
        });

    });

    describe('#update', () => {

        it('1', (done) => {
            const user = createUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then((id: string) => {
                    return userRepository.update(id, { name: newName });
                })
                .then((newUser: User) => {
                    validateUser(newUser, { ...user, name: newName, version: 1 });
                    done();
                })
                .catch(done);
        });

    });

    describe('#delete', () => {

        it('1', (done) => {
            const user = createUser({});
            userRepository
                .add(user)
                .then((id: string) => {
                    return userRepository.get(id);
                })
                .then((newUser: User) => {

                    validateUser(newUser, { ...user, version: 0 });
                    return userRepository.delete(newUser.id)
                        .then(() => {
                            // validateUser(deletedUser, { ...user, version: 0 });
                            return userRepository.get(newUser.id);
                        });
                })
                .then((user: User | void) => {
                    expect(user).to.be.a('undefined');
                    done();
                })
                .catch(done);
        });

    });

    describe('#find', () => {

        it('1', (done) => {
            Promise
                .all([
                    userRepository.add(createUser({})),
                    userRepository.add(createUser({})),
                ])
                .then(() => {
                    return userRepository.find();
                })
                .then((users: User[])=>{
                    expect(users).to.have.lengthOf(2);
                    return userRepository.delete(users[0].id);
                })
                .then(() => {
                    return userRepository.find();
                })
                .then((users: User[]) => {
                    expect(users).to.have.lengthOf(1);
                    done();
                })
                .catch(done);
        });

        it('2', (done) => {
            const name = faker.name.findName();
            Promise
                .all([
                    userRepository.add(createUser({name})),
                    userRepository.add(createUser({})),
                ])
                .then(() => {
                    return userRepository.find(new NameUserSpecification(name));
                })
                .then((users: User[])=>{
                    expect(users).to.have.lengthOf(1);
                    validateUser(users[0], {name});
                    done();
                })
                .catch(done);
        });

    });

    describe('#delete', () => {

        it('1', (done) => {
            userRepository
                .add(createUser({}))
                .then(async (id: string) => {
                    await userRepository.delete(id)
                    return userRepository.get(id);

                })
                .then((user: User | void) => {
                    expect(user).to.be.a('undefined');
                    done();
                })
                .catch(done);
        });

    });

});