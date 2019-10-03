import ICommand from "./ICommand";
import {
    Collection,
    CommonOptions,
    DeleteWriteOpResultObject,
    FindAndModifyWriteOpResultObject, FindOneAndDeleteOption,
    ObjectId
} from "mongodb";
import {Entity} from "../../IMongoRepository";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import IMongoSpecification from "../../../specification/IMongoSpecification";


export default class FindOneAndDeleteCommand<M> implements ICommand<M, M | void>{

    constructor(private specification: IMongoSpecification<M>, private options?: FindOneAndDeleteOption){}

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<M | void> {
        const query = this.specification && this.specification.specified();
        return Promise.resolve()
            .then(()=>{
                if (repositoryOptions.softDelete) {
                    const or = query['$or'] || [];
                    return collection
                        .findOneAndUpdate(
                            {...query, $or: [{isDeleted: false}, {isDeleted: {$exists: false}}, ...or]},
                            {$set: {isDeleted: true}},
                            {returnOriginal: false, ...this.options}
                        );
                }
                return collection
                    .findOneAndDelete(query, this.options);
            })
            .then(async (result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                if (!result.value) {
                    return;
                }
                return await MongoRepository.pipe(result.value, clazz, repositoryOptions);
            });
    }

}