import {
    Collection,
    FilterQuery,
    FindAndModifyWriteOpResultObject,
    FindOneAndUpdateOption,
    ObjectId,
    UpdateQuery
} from 'mongodb';
import { Model, UpdateModel } from '../../IMongoRepository';
import MongoRepository from '../MongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import ICommand from './ICommand';
import { ClassType } from '../../../util';


export default class UpdateByQueryCommand<M extends Model, C> implements ICommand<M, C | void, C> {
    constructor(private _id: ObjectId, private query: UpdateQuery<M>, private options?: FindOneAndUpdateOption<M>) {
    }


    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void | C> {
        const filter: FilterQuery<Model> = { _id: this._id };
        const { $inc, ...query } = this.query;
        const update: UpdateQuery<Model> = {
            ...query,
            $inc: $inc ? { version: 1, ...$inc } : { version: 1 },
        };
        return collection
            .findOneAndUpdate(
                filter,
                update,
                { returnOriginal: false, ...this.options }
            )
            .then((result: FindAndModifyWriteOpResultObject<M>) => {
                if (!result.value) {
                    return;
                }
                return MongoRepository.pipe(result.value, clazz, repositoryOptions);
            });
    }
}
