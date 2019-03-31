import ICommand from "./ICommand";
import {Collection, FindAndModifyWriteOpResultObject, FindOneAndUpdateOption} from "mongodb";
import {Entity, UpdateModel} from "../../IMongoRepository";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import IMongoSpecification from "../../../specification/IMongoSpecification";


export default class FindOneAndUpdateCommand<M> implements ICommand<M, M | void>{

    constructor(private specification: IMongoSpecification<M>, private model: UpdateModel<M>, private options?: FindOneAndUpdateOption){}

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void | M> {
        const query = this.specification && this.specification.specified() || {};
        if (repositoryOptions.softDelete) {
            const or = query['$or'] || [];
            return collection
                .findOneAndUpdate(
                    {...query, $or: [{isDeleted: false}, {isDeleted: {$exists: false}}, ...or]},
                    {
                        $set: {...this.model, lastUpdatedAt: new Date().toISOString()},
                        $inc: {version: 1},
                    },
                    {returnOriginal: false, ...this.options}
                )
                .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                    if (!result.value) {
                        return;
                    }
                    return MongoRepository.pipe(result.value, clazz);
                });
        }
        return collection
            .findOneAndUpdate(
                query,
                {
                    $set: {...this.model, lastUpdatedAt: new Date().toISOString()},
                    $inc: {version: 1},
                },
                {returnOriginal: false, ...this.options}
            )
            .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                if (!result.value) {
                    return;
                }
                return MongoRepository.pipe(result.value, clazz);
            });
    }

}