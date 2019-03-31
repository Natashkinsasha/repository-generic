import ICommand from "./ICommand";
import {Collection, CollectionInsertOneOptions, FindOneOptions, ObjectId} from "mongodb";
import MongoRepository, {ClassType} from "../MongoRepository";
import {CreateModel, Entity} from "../../IMongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";


export default class GetCommand<M> implements ICommand<M, M | void>{

    constructor(private id: string, private  options?: CollectionInsertOneOptions){}

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<M | void> {
        return collection
            .findOne({_id: new ObjectId(this.id)}, this.options)
            .then((e: M & { _id: ObjectId } | null) => {
                if (e) {
                    return MongoRepository.pipe(e, clazz);
                }
                return;
            });
    }





}