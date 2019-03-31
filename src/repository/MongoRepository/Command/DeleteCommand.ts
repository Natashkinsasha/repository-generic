import ICommand from "./ICommand";
import {
    Collection,
    CommonOptions,
    DeleteWriteOpResultObject,
    FindAndModifyWriteOpResultObject,
    ObjectId
} from "mongodb";
import {Entity} from "../../IMongoRepository";
import {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";


export default class DeleteCommand<M> implements ICommand<M, boolean>{

    constructor(private id: string, private options?: CommonOptions & { bypassDocumentValidation?: boolean }){}

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<boolean> {
        if (repositoryOptions.softDelete) {
            return collection
                .findOneAndUpdate(
                    {_id: new ObjectId(this.id)},
                    {$set: {isDeleted: true}},
                    {returnOriginal: false, ...this.options}
                )
                .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                    return !!result.value;
                })
        }
        return collection
            .deleteOne({_id: new ObjectId(this.id)}, this.options)
            .then((result: DeleteWriteOpResultObject) => {
                return !!result.deletedCount;
            });
    }

}