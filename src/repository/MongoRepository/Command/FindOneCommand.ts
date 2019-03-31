import ICommand from "./ICommand";
import {Collection, FindOneOptions, ObjectId} from "mongodb";
import {Entity} from "../../IMongoRepository";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import IMongoSpecification from "../../../specification/IMongoSpecification";


export default class FindOneCommand<M> implements ICommand<M, M | void>{

    constructor(private specification: IMongoSpecification<M>, private options?: FindOneOptions){}

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<M | void> {
        return collection
            .findOne(this.specification.specified(), this.options)
            .then((e: M & { _id: ObjectId } | null) => {
                if (e) {
                    return MongoRepository.pipe(e, clazz);
                }
                return;
            });
    }


}