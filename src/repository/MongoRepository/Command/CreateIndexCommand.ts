import ICommand from "./ICommand";
import {Collection, IndexSpecification} from "mongodb";
import {Entity} from "../../IMongoRepository";
import {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";


export default class CreateIndexCommand<M> implements ICommand<M, void>{

    constructor(private indexSpecs: IndexSpecification[]){}

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void> {
        return collection
            .createIndexes(this.indexSpecs)
            .then(() => {
                return;
            });
    }

}