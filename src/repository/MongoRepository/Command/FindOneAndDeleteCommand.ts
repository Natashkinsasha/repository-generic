import ICommand from "./ICommand";
import {
    Collection,
    CommonOptions,
    DeleteWriteOpResultObject,
    FindAndModifyWriteOpResultObject, FindOneAndDeleteOption,
    ObjectId
} from "mongodb";
import {Model} from "../../IMongoRepository";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import IMongoSpecification from "../../../specification/IMongoSpecification";


export default class FindOneAndDeleteCommand<M extends Model, C> implements ICommand<M, C | void, C>{

    constructor(private specification: IMongoSpecification<M>, private options?: FindOneAndDeleteOption){}

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M,C>): Promise<C | void> {
        const query = this.specification.specified();
        return Promise.resolve()
            .then(()=>{
                return collection
                    .findOneAndDelete(query, this.options);
            })
            .then(async (result: FindAndModifyWriteOpResultObject<M>) => {
                if (!result.value) {
                    return;
                }
                return await MongoRepository.pipe(result.value, clazz, repositoryOptions);
            });
    }

}
