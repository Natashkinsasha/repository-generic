import ICommand from './ICommand';
import { Collection, Filter, FindOptions, ObjectId } from 'mongodb';
import MongoRepository from '../MongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import { Model } from '../../IMongoRepository';
import { ClassType } from '../../../util';


export default class GetCommand<M extends Model, C> implements ICommand<M, C | void, C> {
    constructor(private _id: ObjectId, private options?: FindOptions) {}

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<C | void> {
        const query: Filter<Model> = { _id: this._id };
        return collection
            .findOne(query, this.options)
            .then((e: M | null) => {
                if (e) {
                    return MongoRepository.pipe(e, clazz, repositoryOptions);
                }
                return;
            });
    }
}
