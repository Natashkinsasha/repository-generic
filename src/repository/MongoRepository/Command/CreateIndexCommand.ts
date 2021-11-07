import ICommand from './ICommand';
import { Collection, IndexDescription } from 'mongodb';
import { Model } from '../../IMongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import { ClassType } from '../../../util';


export default class CreateIndexCommand<M extends Model, C> implements ICommand<M, void, C> {
    constructor(private readonly indexSpecs: IndexDescription[]) {}

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void> {
        return collection
            .createIndexes(this.indexSpecs)
            .then(() => {
                return;
            });
    }
}
