import ICommand from "./ICommand";
import {
    Collection,
    CommonOptions,
    DeleteWriteOpResultObject, FilterQuery,
    ObjectId
} from "mongodb";
import {Model} from "../../IMongoRepository";
import {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";


export default class DeleteCommand<M extends Model, C> implements ICommand<M, boolean, C>{

    constructor(private _id: ObjectId, private options?: CommonOptions & { bypassDocumentValidation?: boolean }){}

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M,C>): Promise<boolean> {
        const query: FilterQuery<Model> = {_id: this._id};
        return collection
            .deleteOne(query, this.options)
            .then((result: DeleteWriteOpResultObject) => {
                return !!result.deletedCount;
            });
    }

}
