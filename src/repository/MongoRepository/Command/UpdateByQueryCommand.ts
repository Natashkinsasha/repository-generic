import {
    Collection,
    FilterQuery,
    FindAndModifyWriteOpResultObject,
    FindOneAndUpdateOption,
    ObjectId,
    UpdateQuery
} from "mongodb";
import {Model, UpdateModel} from "../../IMongoRepository";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import {validate, ValidationError} from "class-validator";
import {plainToClass} from "class-transformer";
import RepositoryValidationError from "../../../error/RepositoryValidationError";
import ICommand from "./ICommand";


export default class UpdateByQueryCommand<M extends Model, C> implements ICommand<M, C | void, C> {

    constructor(private _id: ObjectId, private  query: UpdateQuery<M>, private options?: FindOneAndUpdateOption) {
    }


    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M,C>): Promise<void | C> {
        const filter: FilterQuery<Model> = {_id: this._id};
        const {$inc, ...query} = this.query;
        const update: UpdateQuery<Model> = {
            ...query,
            $inc: $inc? {version: 1, ...$inc}: {version: 1},
        };
        return collection
            .findOneAndUpdate(
                filter,
                update,
                {returnOriginal: false, ...this.options}
            )
            .then(async (result: FindAndModifyWriteOpResultObject<M>) => {
                if (!result.value) {
                    return;
                }
                return await MongoRepository.pipe(result.value, clazz, repositoryOptions);
            });
    }

}
