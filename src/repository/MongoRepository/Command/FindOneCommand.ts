import ICommand from "./ICommand";
import {Collection, FindOneOptions, ObjectId} from "mongodb";
import {Model} from "../../IMongoRepository";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import IMongoSpecification from "../../../specification/IMongoSpecification";


export default class FindOneCommand<M extends Model, C> implements ICommand<M, C | void, C> {

    constructor(private specification: IMongoSpecification<M>, private options?: FindOneOptions) {
    }

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M,C>): Promise<C | void> {
        return Promise.resolve()
            .then(()=>{
                const query = this.specification.specified();
                return collection
                    .findOne(query, this.options)
            })
            .then(async (e: M | null) => {
                if (e) {
                    return await MongoRepository.pipe(e, clazz, repositoryOptions);
                }
                return;
            });
    }


}
