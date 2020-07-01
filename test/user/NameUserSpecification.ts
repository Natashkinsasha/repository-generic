import User from "./User";
import IMongoSpecification from "../../src/specification/IMongoSpecification"
import {FilterQuery} from "mongodb";

export default class NameUserSpecification implements IMongoSpecification<User>{

    private readonly name: string;

    constructor(name: string){
        this.name = name;
    }

    public specified(): FilterQuery<User> {
        return {
            name: this.name,
        };
    }

}
