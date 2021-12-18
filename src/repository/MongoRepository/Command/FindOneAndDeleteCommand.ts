import ICommand from './ICommand';
import {
    Collection, FindOneAndDeleteOptions,
    ModifyResult,
} from 'mongodb';
import { Model } from '../../IMongoRepository';
import MongoRepository from '../MongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import IMongoSpecification from '../../../specification/IMongoSpecification';
import { ClassType, pipe } from '../../../util';


export default class FindOneAndDeleteCommand<M extends Model, C> implements ICommand<M, C | void, C> {
    constructor(private specification: IMongoSpecification<M>, private options?: FindOneAndDeleteOptions) {}

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<C | void> {
        const query = this.specification.specified();
        return collection
            .findOneAndDelete(query, this.options ?? {})
            .then((result: ModifyResult<M>) => {
                if (!result.value) {
                    return;
                }
                return pipe(result.value, clazz, repositoryOptions);
            });
    }
}
