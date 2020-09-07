import ICommand from './ICommand';
import { Collection, CommonOptions, DeleteWriteOpResultObject } from 'mongodb';
import { Model } from '../../IMongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import { ClassType } from '../../../util';


export default class CleanCommand<M extends Model, C> implements ICommand<M, number, C> {
    constructor(private options?: CommonOptions) {
    }


    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<number> {
        return collection
            .deleteMany({}, this.options)
            .then((resultObject: DeleteWriteOpResultObject) => {
                return resultObject.result.n || 0;
            });
    }
}
