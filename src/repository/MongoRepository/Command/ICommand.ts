import { Collection, ObjectId } from 'mongodb';
import IRepositoryOptions from '../../IRepositoryOptions';
import { Model } from '../../IMongoRepository';
import { ClassType } from '../../../util';


export default interface ICommand<M extends Model, T, C>{

    execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<T>

}
