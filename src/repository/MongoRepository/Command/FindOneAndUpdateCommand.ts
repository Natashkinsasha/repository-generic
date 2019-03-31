import ICommand from "./ICommand";
import {Collection, FindAndModifyWriteOpResultObject, FindOneAndUpdateOption} from "mongodb";
import {Entity, UpdateModel} from "../../IMongoRepository";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import IMongoSpecification from "../../../specification/IMongoSpecification";


export default class FindOneAndUpdateCommand<M> implements ICommand<M, M | void>{

    constructor(private specification: IMongoSpecification<M>, private model: UpdateModel<M>, private options?: FindOneAndUpdateOption){}

    execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void | M> {
        return collection
            .findOneAndUpdate(
                this.specification.specified(),
                {
                    $set: {...this.model, lastUpdatedAt: new Date().toISOString()},
                    $inc: {version: 1},
                },
                {returnOriginal: false, ...this.options}
            )
            .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                if (!result.value) {
                    return;
                }
                return MongoRepository.pipe(result.value, clazz);
            });
    }

}