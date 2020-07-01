import ICommand from "./ICommand";
import {Collection, IndexSpecification} from "mongodb";
import {Model} from "../../IMongoRepository";
import {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";


export default class CreateIndexCommand<M extends Model> implements ICommand<M, void>{

    constructor(private indexSpecs: IndexSpecification[]){}

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void> {
        return collection
            .createIndexes(this.indexSpecs)
            .then(() => {
                return;
            });
    }

}
