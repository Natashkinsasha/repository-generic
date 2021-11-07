import ICommand from './ICommand';
import {
    Collection,
    DeleteOptions,
    Filter,
    ObjectId,
    DeleteResult,
} from 'mongodb';
import { Model } from '../../IMongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import { ClassType } from '../../../util';


export default class DeleteCommand<M extends Model, C> implements ICommand<M, boolean, C> {
    constructor(private _id: ObjectId, private options?: DeleteOptions) {}

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<boolean> {
        const query: Filter<Model> = { _id: this._id };
        return collection
            .deleteOne(query, this.options ?? {})
            .then((result: DeleteResult) => {
                return !!result.deletedCount;
            });
    }
}
