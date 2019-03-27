import * as mongodb from "mongodb";
import * as redis from "redis";
import * as chai from "chai";
import UserRepository from "./user/UserRepository";
import {createCreateUser, validateUser} from "./util";
import User from "./user/User";
import * as faker from "faker";
import MongoDbHelper from "../src/helper/MongoDbHelper";
import NameUserSpecification from "./user/NameUserSpecification";
import Purchase from "./user/Purchase";


describe('Test UserRepository', () => {

    const {expect} = chai;

    let db: mongodb.Db;
    let mongoClient: mongodb.MongoClient;
    let userRepository: UserRepository;
    let redisClient: redis.RedisClient;


    before(async () => {
        mongoClient = await mongodb.MongoClient.connect("mongodb://localhost:27017")
            .then((client: mongodb.MongoClient) => {
                db = client.db("test");
                return client;
            });
        redisClient = redis.createClient("redis://localhost:6379");
        userRepository = new UserRepository(db, mongoClient, redisClient);
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
            const user = createCreateUser({});
            userRepository
                .add(user)
                .then((id: string) => {
                    expect(id).to.be.a('string');
                    done();
                })
                .catch(done);
        });

        it('2', (done) => {
            userRepository
                .add({purchase: [new Purchase("")]})
                .catch((err: Error) => {
                    expect(err.name).to.equal("RepositoryValidationError");
                    done();
                })
                .catch(done);
        });

    });


    describe('#get', () => {

        it('1', (done) => {
            const user = createCreateUser({purchase: [new Purchase(new Date().toISOString())]});
            userRepository
                .add(user)
                .then((id: string) => {
                    return userRepository.get(id);
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, version: 0});
                    return userRepository.get(newUser.id);
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, version: 0});
                    done();
                })
                .catch(done);
        });

    });

    describe('#findOne', () => {

        it('1', (done) => {
            const name = faker.name.findName();
            const user = createCreateUser({name});
            userRepository
                .add(user)
                .then((id: string) => {
                    return userRepository.findOne(new NameUserSpecification(name));
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, version: 0});
                    done();
                })
                .catch(done);
        });

    });

    describe('#findAndUpdate', () => {

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

    describe('#update', () => {

        it('1', (done) => {
            const user = createCreateUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then((id: string) => {
                    return userRepository.update(id, {name: newName});
                })
                .then((newUser: User) => {
                    validateUser(newUser, {...user, name: newName, version: 1});
                    done();
                })
                .catch(done);
        });

    });

    describe('#replace', () => {

        it('1', (done) => {
            const user = createCreateUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then((id: string) => {
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

    });

    describe('#delete', () => {

        it('1', (done) => {
            const user = createCreateUser({});
            userRepository
                .add(user)
                .then((id: string) => {
                    return userRepository.get(id);
                })
                .then((newUser: User) => {

                    validateUser(newUser, {...user, version: 0});
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
                    userRepository.add(createCreateUser({})),
                    userRepository.add(createCreateUser({})),
                ])
                .then(() => {
                    return userRepository.find();
                })
                .then((users: User[]) => {
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
                    userRepository.add(createCreateUser({name})),
                    userRepository.add(createCreateUser({})),
                ])
                .then(() => {
                    return userRepository.find(new NameUserSpecification(name));
                })
                .then((users: User[]) => {
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
                .add(createCreateUser({}))
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

    describe('#transaction', () => {


        it.skip('1', (done) => {
            const user = createCreateUser({});
            const newName = faker.name.findName();
            userRepository
                .add(user)
                .then((id: string) => {
                    return userRepository
                        .transaction(async (session) => {
                            await userRepository.update(id, {name: newName}, {session})
                            return userRepository.get(id, {session});
                        });
                })
                .then((newUser: User) => {
                    expect(newUser).to.be.a('object')
                    newUser && validateUser(newUser, {...user, name: newName, version: 1});
                    done();
                })
                .catch(done);
        });

        it('2', (done) => {
            const user = createCreateUser({});
            userRepository
                .add(user)
                .then((id: string) => {
                    return userRepository
                        .transaction(async (session) => {
                            await userRepository.get(id, {session})
                            await userRepository.update(id, {name: faker.name.findName()});
                            await userRepository.update(id, {name: faker.name.findName()}, {session})
                        });
                })
                .catch(() => {
                    done();
                })
                .catch(done);
        });


    });

});