import ICommand from './ICommand';
import { Collection, FindOneAndUpdateOptions, ModifyResult, UpdateFilter } from 'mongodb';
import { Model } from '../../IMongoRepository';
import MongoRepository from '../MongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import IMongoSpecification from '../../../specification/IMongoSpecification';
import { ClassType } from '../../../util';

export default class FindOneAndUpdateByQueryCommand<M extends Model, C> implements ICommand<M, C | void, C> {
    constructor(private readonly specification: IMongoSpecification<M>, private readonly query: UpdateFilter<M>, private readonly options?: FindOneAndUpdateOptions) {}

    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void | C> {
        const filter = this.specification.specified();
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
