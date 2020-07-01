import ICommand from "./ICommand";
import {Model} from "../../IMongoRepository";
import {Collection, Cursor, FindOneOptions} from "mongodb";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import IMongoSpecification from "../../../specification/IMongoSpecification";


export default class FindCommand<M extends Model> implements ICommand<M, ReadonlyArray<M>> {

    constructor(private specification?: IMongoSpecification<M>,
                private skip: number = 0,
                private limit: number = Infinity,
                private sort: Map<string, number> = new Map(),
                private options?: FindOneOptions) {
    }

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<ReadonlyArray<M>> {
        return this.buildLimit(this.buildSkip(this.buildSort(this.buildFind(repositoryOptions, collection, this.specification, this.options), this.sort), this.skip), this.limit)
            .toArray()
            .then((array: ReadonlyArray<M>) => {
                return Promise.all(array.map((entity: M) => MongoRepository.pipe(entity, clazz, repositoryOptions)));
            });
    }


    private buildFind(
        repositoryOptions: IRepositoryOptions,
        collection: Collection<M>,
        specification?: IMongoSpecification<M>,
        options?: FindOneOptions
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

    private buildSort(cursor: Cursor<M>, sort: Map<string, number>): Cursor<M> {
        if (sort.size > 0) {
            return cursor.sort(sort);
        }
        return cursor;
    }

}
