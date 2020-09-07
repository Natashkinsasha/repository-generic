import ICommand from './ICommand';
import { Collection, FindAndModifyWriteOpResultObject, FindOneAndUpdateOption, UpdateQuery } from 'mongodb';
import { Model } from '../../IMongoRepository';
import MongoRepository from '../MongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import IMongoSpecification from '../../../specification/IMongoSpecification';
import { ClassType } from '../../../util';

export default class FindOneAndUpdateByQueryCommand<M extends Model, C> implements ICommand<M, C | void, C> {
    constructor(private readonly specification: IMongoSpecification<M>, private readonly query: UpdateQuery<M>, private readonly options?: FindOneAndUpdateOption<M>) {}

    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void | C> {
        const filter = this.specification.specified();
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
