import ICommand from "./ICommand";
import {Entity} from "../../IMongoRepository";
import {Collection, Cursor, FindOneOptions} from "mongodb";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import IMongoSpecification from "../../../specification/IMongoSpecification";


export default class FindCommand<M> implements ICommand<M, ReadonlyArray<M>> {

    constructor(private specification?: IMongoSpecification<M>,
                private skip: number = 0,
                private limit: number = Infinity,
                private sort: Map<string, number> = new Map(),
                private options?: FindOneOptions) {
    }

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<ReadonlyArray<M>> {
        return this.buildLimit(this.buildSkip(this.buildSort(this.buildFind(repositoryOptions, collection, this.specification, this.options), this.sort), this.skip), this.limit)
            .toArray()
            .then((array: ReadonlyArray<Entity<M>>) => {
                return array.map((entity: Entity<M>) => MongoRepository.pipe(entity, clazz));
            });
    }


    private buildFind(
        repositoryOptions: IRepositoryOptions,
        collection: Collection<Entity<M>>,
        specification?: IMongoSpecification<M>,
        options?: FindOneOptions
    ): Cursor<Entity<M>> {
        const query = specification && specification.specified() || {};
        if (repositoryOptions.softDelete) {
            return collection.find({...query, $or: [{idDeleted: false}, {idDeleted: {$exists: false}}]}, options);
        }
        return collection.find(query, options);
    }

    private buildSkip(cursor: Cursor<Entity<M>>, skip: number): Cursor<Entity<M>> {
        if (skip > 0) {
            return cursor.skip(skip);
        }
        return cursor;
    }

    private buildLimit(cursor: Cursor<Entity<M>>, limit: number): Cursor<Entity<M>> {
        if (limit !== Infinity) {
            return cursor.limit(limit);
        }
        return cursor;
    }

    private buildSort(cursor: Cursor<Entity<M>>, sort: Map<string, number>): Cursor<Entity<M>> {
        if (sort.size > 0) {
            return cursor.sort(sort);
        }
        return cursor;
    }

}