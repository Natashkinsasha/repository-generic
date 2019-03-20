import * as faker from "faker";
import * as chai from "chai";
import { plainToClass } from 'class-transformer';
import { ObjectId } from 'bson';
import User from "./user/User";
import {CreateModel} from "../src";

const { expect } = chai;

export function createCreateUser(user: Partial<User>): CreateModel<User>{
    return plainToClass(User,{
        name: faker.name.findName(),
        ...user,
    });
}

export function validateUser(user: User, expectUser?: Partial<User>){
    expect(user).to.be.a('object');

    expect(user.id).to.be.a('string');
    expectUser && expectUser.id && expect(user.id).to.equal(expectUser.id);

    user.name && expect(user.name).to.be.a('string');
    expectUser && expectUser.name && expect(user.name).to.equal(expectUser.name);

    user.version && expect(user.version).to.be.a('number');
    expectUser && expectUser.version && expect(user.version).to.equal(expectUser.version);

    user.createdAt && expect(user.createdAt).to.be.a('string');
    expectUser && expectUser.createdAt && expect(user.createdAt).to.equal(expectUser.createdAt);

    user.lastUpdateAt && expect(user.lastUpdateAt).to.be.a('string');
    expectUser && expectUser.lastUpdateAt && expect(user.lastUpdateAt).to.equal(expectUser.lastUpdateAt);

}
