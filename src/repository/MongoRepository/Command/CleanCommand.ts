import ICommand from "./ICommand";
import {Collection, CommonOptions, DeleteWriteOpResultObject, UpdateWriteOpResult} from "mongodb";
import {Entity} from "../../IMongoRepository";
import {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";


export default class CleanCommand<M> implements ICommand<M, number> {

    constructor(private options?: CommonOptions) {
    }


    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<number> {
        if (repositoryOptions.softDelete) {
            return collection
                .updateMany(
                    {},
                    {
                        $set: {isDeleted: true},
                    },
                    this.options,
                )
                .then((resultObject: UpdateWriteOpResult) => {
                    return resultObject.result.n || 0;
                });
        }
        return collection
            .deleteMany({}, this.options)
            .then((resultObject: DeleteWriteOpResultObject) => {
                return resultObject.result.n || 0;
            });
    }

}