import {
    Collection,
    Filter,
    FindOneAndUpdateOptions,
    ModifyResult,
    ObjectId,
    UpdateFilter,
} from 'mongodb';
import { Model } from '../../IMongoRepository';
import MongoRepository from '../MongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import ICommand from './ICommand';
import { ClassType } from '../../../util';


export default class UpdateByQueryCommand<M extends Model, C> implements ICommand<M, C | void, C> {
    constructor(private _id: ObjectId, private query: UpdateFilter<M>, private options?: FindOneAndUpdateOptions) {
    }


    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void | C> {
        const filter: Filter<Model> = { _id: this._id };
        const { $inc, $set, ...query } = this.query;
        const update: any = {
            ...query,
            $set: $set ? { ...$set, lastUpdatedAt: new Date() } : { lastUpdatedAt: new Date() },
            $inc: $inc ? { version: 1, ...$inc } : { version: 1 },
        };
        return collection
            .findOneAndUpdate(
                filter,
                update,
                { returnDocument: 'after', ...this.options }
            )
            .then((result: ModifyResult<M>) => {
                if (!result.value) {
                    return;
                }
                return MongoRepository.pipe(result.value, clazz, repositoryOptions);
            });
    }
}
