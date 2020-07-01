import UserEntity from "./UserEntity";
import IMongoSpecification from "../../src/specification/IMongoSpecification"
import {FilterQuery} from "mongodb";

export default class NameUserSpecification implements IMongoSpecification<UserEntity>{

    private readonly name: string;

    constructor(name: string){
        this.name = name;
    }

    public specified(): FilterQuery<UserEntity> {
        return {
            name: this.name,
        };
    }

}
