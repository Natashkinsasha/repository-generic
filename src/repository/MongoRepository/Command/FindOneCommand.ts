import ICommand from "./ICommand";
import {Collection, FindOneOptions, ObjectId} from "mongodb";
import {Entity} from "../../IMongoRepository";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import IMongoSpecification from "../../../specification/IMongoSpecification";


export default class FindOneCommand<M> implements ICommand<M, M | void> {

    constructor(private specification: IMongoSpecification<M>, private options?: FindOneOptions) {
    }

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<M | void> {
        const query = this.specification && this.specification.specified() || {};
        if (repositoryOptions.softDelete) {
            const or = query['$or'] || [];
            return collection
                .findOne({...query, $or: [{isDeleted: false}, {isDeleted: {$exists: false}}, ...or]}, this.options)
                .then((e: M & { _id: ObjectId } | null) => {
                    if (e) {
                        return MongoRepository.pipe(e, clazz);
                    }
                    return;
                });
        }
        return collection
            .findOne(query, this.options)
            .then((e: M & { _id: ObjectId } | null) => {
                if (e) {
                    return MongoRepository.pipe(e, clazz);
                }
                return;
            });
    }


}