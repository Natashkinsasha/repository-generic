import ICommand from "./ICommand";
import {Collection, CollectionInsertOneOptions, FilterQuery, ObjectId} from "mongodb";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import {Model} from "../../IMongoRepository";


export default class GetCommand<M extends Model, C> implements ICommand<M, C | void, C>{

    constructor(private _id: ObjectId, private  options?: CollectionInsertOneOptions){}

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<C | void> {
        const query: FilterQuery<Model> = {_id: this._id};
        return collection
            .findOne(query, this.options)
            .then(async (e: M & { _id: ObjectId } | null) => {
                if (e) {
                    return await MongoRepository.pipe(e, clazz, repositoryOptions);
                }
                return;
            });
    }





}
