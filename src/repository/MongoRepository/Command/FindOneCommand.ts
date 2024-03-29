import ICommand from './ICommand';
import { Collection, FindOptions } from 'mongodb';
import { Model } from '../../IMongoRepository';
import MongoRepository from '../MongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import IMongoSpecification from '../../../specification/IMongoSpecification';
import { ClassType, pipe } from '../../../util';


export default class FindOneCommand<M extends Model, C> implements ICommand<M, C | void, C> {
    constructor(private specification: IMongoSpecification<M>, private options?: FindOptions) {
    }

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<C | void> {
        const query = this.specification.specified();
        return collection
            .findOne(query, this.options)
            .then((e: M | null) => {
                if (e) {
                    return pipe(e, clazz, repositoryOptions);
                }
                return;
            });
    }
}
