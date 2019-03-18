import User from "./User";
import IMongoSpecification, {FilterQuery} from "../../src/specification/IMongoSpecification"
import {Entity} from "../../src/repository/MongoRepository";

export default class NameUserSpecification implements IMongoSpecification<User>{

    private readonly name: string;

    constructor(name: string){
        this.name = name;
    }

    specified(): FilterQuery<Entity<User>> {
        return {
            name: this.name,
        };
    }

}
