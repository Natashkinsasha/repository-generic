import ICommand from "./ICommand";
import {Collection, UpdateManyOptions} from "mongodb";
import {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import {Entity, UpdateModel} from "../../IMongoRepository";
import IMongoSpecification from "../../../specification/IMongoSpecification";


export default class FindAndUpdateCommand<M>implements ICommand<M, void>{

    constructor(private specification: IMongoSpecification<M>, private model: UpdateModel<M>, private options?: UpdateManyOptions){

    }

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void> {
        return collection
            .updateMany(
                this.specification.specified(),
                {
                    $set: {...this.model, lastUpdatedAt: new Date().toISOString()},
                    $inc: {version: 1},
                },
                this.options,
            )
            .then(() => {
                return;
            });
    }

}