import ICommand from "./ICommand";
import {Collection, CollectionInsertOneOptions, ObjectId} from "mongodb";
import MongoRepository, {ClassType} from "../MongoRepository";
import {Entity} from "../../IMongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";


export default class GetCommand<M> implements ICommand<M, M | void>{

    constructor(private id: string, private  options?: CollectionInsertOneOptions){}

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<M | void> {
        if (repositoryOptions.softDelete) {
            return collection
                .findOne({_id: new ObjectId(this.id), $or: [{isDeleted: false}, {isDeleted: {$exists: false}}]}, this.options)
                .then(async (e: M & { _id: ObjectId } | null) => {
                    if (e) {
                        return await MongoRepository.pipe(e, clazz, repositoryOptions);
                    }
                    return;
                });
        }
        return collection
            .findOne({_id: new ObjectId(this.id)}, this.options)
            .then(async (e: M & { _id: ObjectId } | null) => {
                if (e) {
                    return await MongoRepository.pipe(e, clazz, repositoryOptions);
                }
                return;
            });
    }





}