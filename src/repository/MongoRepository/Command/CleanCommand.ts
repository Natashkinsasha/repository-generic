import ICommand from "./ICommand";
import {Collection, CommonOptions, DeleteWriteOpResultObject} from "mongodb";
import {Model} from "../../IMongoRepository";
import {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";


export default class CleanCommand<M extends Model> implements ICommand<M, number> {

    constructor(private options?: CommonOptions) {
    }


    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<number> {
        return collection
            .deleteMany({}, this.options)
            .then((resultObject: DeleteWriteOpResultObject) => {
                return resultObject.result.n || 0;
            });
    }

}
