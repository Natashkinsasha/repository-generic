import {ObjectId} from "mongodb";
import IMongoSpecification, {FilterQuery} from "./IMongoSpecification";
import {Entity, Model} from "../repository/MongoRepository";



export default class IdSpecification implements IMongoSpecification<Model>{

    private readonly id: string;

    constructor(id: string){
        this.id = id;
    }

    specified(): FilterQuery<Entity<Model>> {
        return {_id: new ObjectId(this.id)};
    }


}