import ICommand from './ICommand';
import { Collection, DeleteOptions, DeleteResult } from 'mongodb';
import { Model } from '../../IMongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import { ClassType } from '../../../util';


export default class CleanCommand<M extends Model, C> implements ICommand<M, number, C> {
    constructor(private options?: DeleteOptions) {
    }


    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<number> {
        return collection
            .deleteMany({}, this.options ?? {})
            .then((resultObject: DeleteResult) => {
                return resultObject.deletedCount;
            });
    }
}
