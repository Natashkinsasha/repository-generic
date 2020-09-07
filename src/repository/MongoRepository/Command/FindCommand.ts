import ICommand from './ICommand';
import { Model } from '../../IMongoRepository';
import { Collection, Cursor, FindOneOptions, SortOptionObject } from 'mongodb';
import MongoRepository from '../MongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import IMongoSpecification from '../../../specification/IMongoSpecification';
import { ClassType } from '../../../util';


export default class FindCommand<M extends Model, C> implements ICommand<M, ReadonlyArray<C>, C> {
    constructor(private specification?: IMongoSpecification<M>,
                private skip: number = 0,
                private limit: number = Infinity,
                private sort?: { keyOrList: string | Array<[string, number]> | SortOptionObject<M>, direction?: number },
                private options?: FindOneOptions<M extends M?M:M>) {
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
        options?: FindOneOptions<M extends M?M:M>
    ): Cursor<M> {
        const query = specification && specification.specified() || {};
        return collection.find(query, options);
    }

    private buildSkip(cursor: Cursor<M>, skip: number): Cursor<M> {
        if (skip > 0) {
            return cursor.skip(skip);
        }
        return cursor;
    }

    private buildLimit(cursor: Cursor<M>, limit: number): Cursor<M> {
        if (limit !== Infinity) {
            return cursor.limit(limit);
        }
        return cursor;
    }

    private buildSort(cursor: Cursor<M>, sort?: { keyOrList: string | Array<[string, number]> | SortOptionObject<M>, direction?: number }): Cursor<M> {
        if (sort) {
            return cursor.sort(sort.keyOrList, sort.direction);
        }
        return cursor;
    }
}
