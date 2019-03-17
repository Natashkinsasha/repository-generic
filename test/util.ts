import * as faker from "faker";
import * as chai from "chai";
import { plainToClass } from 'class-transformer';
import { ObjectId } from 'bson';
import User from "./user/User";

const { expect } = chai;

export function createUser(user: Partial<User>): User{
    return plainToClass(User,{
        roles: [],
        name: faker.name.findName(),
        instantFacebookId: new ObjectId().toHexString(),
        imageUrl: faker.image.imageUrl(),
        locale: faker.random.locale(),
        instantFacebookfriends: [],
        ...user,
    });
}

export function validateUser(user: User, expectUser?: Partial<User>){
    expect(user).to.be.a('object');

    expect(user.id).to.be.a('string');
    expectUser && expectUser.id && expect(user.id).to.equal(expectUser.id);

    user.imageUrl && expect(user.imageUrl).to.be.a('string');
    expectUser && expectUser.imageUrl && expect(user.imageUrl).to.equal(expectUser.imageUrl);

    user.countryCode && expect(user.countryCode).to.be.a('string');
    expectUser && expectUser.countryCode && expect(user.countryCode).to.equal(expectUser.countryCode);

    user.instantFacebookFriends && expect(user.instantFacebookFriends).to.be.a('array');
    expectUser && expectUser.instantFacebookFriends && expect(user.instantFacebookFriends).to.deep.equal(expectUser.instantFacebookFriends);

    user.instantFacebookId && expect(user.instantFacebookId).to.be.a('string');
    expectUser && expectUser.instantFacebookId && expect(user.instantFacebookId).to.equal(expectUser.instantFacebookId);

    user.locale && expect(user.locale).to.be.a('string');
    expectUser && expectUser.locale && expect(user.locale).to.equal(expectUser.locale);

    user.name && expect(user.name).to.be.a('string');
    expectUser && expectUser.name && expect(user.name).to.equal(expectUser.name);

    user.version && expect(user.version).to.be.a('number');
    expectUser && expectUser.version && expect(user.version).to.equal(expectUser.version);

    user.createdAt && expect(user.createdAt).to.be.a('string');
    expectUser && expectUser.createdAt && expect(user.createdAt).to.equal(expectUser.createdAt);

    user.lastUpdateAt && expect(user.lastUpdateAt).to.be.a('string');
    expectUser && expectUser.lastUpdateAt && expect(user.lastUpdateAt).to.equal(expectUser.lastUpdateAt);

}
