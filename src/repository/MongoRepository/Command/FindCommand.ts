import ICommand from './ICommand';
import { Model } from '../../IMongoRepository';
import { Collection, FindCursor, FindOptions, Sort, SortDirection } from 'mongodb';
import MongoRepository from '../MongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import IMongoSpecification from '../../../specification/IMongoSpecification';
import { ClassType } from '../../../util';


export default class FindCommand<M extends Model, C> implements ICommand<M, ReadonlyArray<C>, C> {
    constructor(private specification?: IMongoSpecification<M>,
                private skip: number = 0,
                private limit: number = Infinity,
                private sort?: { sort: Sort | string, direction?: SortDirection },
                private options?: FindOptions) {
    }

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<ReadonlyArray<C>> {
        return this.buildLimit(this.buildSkip(this.buildSort(this.buildFind(repositoryOptions, collection, this.specification, this.options), this.sort), this.skip), this.limit)
            .toArray()
            .then((array: ReadonlyArray<M>) => {
                return Promise.all(array.map((entity: M) => MongoRepository.pipe(entity, clazz, repositoryOptions)));
            });
    }


    private buildFind(
        repositoryOptions: IRepositoryOptions<M, C>,
        collection: Collection<M>,
        specification?: IMongoSpecification<M>,
        options?: FindOptions
    ): FindCursor<M> {
        // eslint-disable-next-line no-mixed-operators
        const query = specification && specification.specified() || {};
        return collection.find(query, options);
    }

    private buildSkip(cursor: FindCursor<M>, skip: number): FindCursor<M> {
        if (skip > 0) {
            return cursor.skip(skip);
        }
        return cursor;
    }

    private buildLimit(cursor: FindCursor<M>, limit: number): FindCursor<M> {
        if (limit !== Infinity) {
            return cursor.limit(limit);
        }
        return cursor;
    }

    private buildSort(cursor: FindCursor<M>, sort?: { sort: Sort | string, direction?: SortDirection }): FindCursor<M> {
        if (sort) {
            return cursor.sort(sort.sort, sort.direction);
        }
        return cursor;
    }
}
