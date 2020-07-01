import * as faker from "faker";
import * as chai from "chai";
import { plainToClass } from 'class-transformer';
import { ObjectId } from 'bson';
import UserEntity from "./user/UserEntity";
import {CreateModel} from "../src";
import User from "./user/User";

const { expect } = chai;

export function createCreateUser(user: Partial<UserEntity>): CreateModel<UserEntity>{
    return {
        name: faker.name.findName(),
        purchase: [],
        ...user,
    };
}

export function validateUser(user: User, expectUser?: Partial<UserEntity>): void{
    expect(user).to.be.a('object');


    expect(user.name).to.be.a('string');
    expectUser && expectUser.name && expect(user.name).to.equal(expectUser.name);

    expect(user.purchase).to.be.a('array');
    expectUser && expectUser.purchase && expect(user.purchase).to.deep.equal(expectUser.purchase);

    user.version && expect(user.version).to.be.a('number');
    expectUser && expectUser.version && expect(user.version).to.equal(expectUser.version);

    expect(user.createdAt).to.be.an.instanceof(Date);
    expect(user.lastUpdatedAt).to.be.an.instanceof(Date);


}
