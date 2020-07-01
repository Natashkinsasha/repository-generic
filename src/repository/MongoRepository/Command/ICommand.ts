import {Collection, ObjectId} from "mongodb";
import {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import {Model} from "../../IMongoRepository";


export default interface ICommand<M extends Model, T, C>{

    execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M,C>): Promise<T>

}
