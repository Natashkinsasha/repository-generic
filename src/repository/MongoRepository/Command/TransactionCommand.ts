import ICommand from './ICommand';
import { ClientSession, Collection, MongoClient } from 'mongodb';
import { Model } from '../../IMongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import { ClassType } from '../../../util';


export default class TransactionCommand<M extends Model, T, C> implements ICommand<M, T, C> {
    constructor(private client: MongoClient, private cb: (session: ClientSession) => Promise<T>) {}


    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<T> {
        const session = this.client.startSession();
        session.startTransaction();
        return this.cb(session)
            .then((result: T) => {
                return session.commitTransaction()
                    .then(() => {
                        return result;
                    });
            }, (err: Error) => {
                return session.abortTransaction()
                    .then(() => {
                        throw err;
                    });
            });
    }
}
