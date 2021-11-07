import IRepository from './IRepository';
import {
    ClientSession, DeleteOptions, Filter, FindOneAndReplaceOptions, FindOneAndUpdateOptions, FindOptions, IndexDescription,
    InsertOneOptions,
    ObjectId,
    OptionalId, Sort, SortDirection, UpdateFilter, UpdateOptions,
} from 'mongodb';
import { Subtract } from '../util';
import IMongoSpecification from '../specification/IMongoSpecification';


export interface Model {
    _id: ObjectId;
    version: number;
    createdAt: Date;
    lastUpdatedAt: Date;
}

export type CreateModel<M> = OptionalId<Subtract<M, Model>>;

export type UpdateModel<M> = Partial<CreateModel<M>>;


export default interface IMongoRepository<M extends Model, C> extends IRepository<C, ObjectId, CreateModel<M>, UpdateModel<M>, Filter<M>, IMongoSpecification<M>> {

    find(
        specification?: IMongoSpecification<M>,
        // eslint-disable-next-line default-param-last
        skip?: number,
        // eslint-disable-next-line default-param-last
        limit?: number,
        sort?: { sort: Sort | string, direction?: SortDirection },
        options?: FindOptions
    ): Promise<ReadonlyArray<C>>

    transaction<T>(cb: (session: ClientSession) => Promise<T>): Promise<T>;

    createIndexes(indexSpecs: IndexDescription[]): Promise<void>;

    add(model: CreateModel<M>, options?: InsertOneOptions): Promise<ObjectId>;

    get(_id: ObjectId, options?: FindOptions<M>): Promise<C | void>;

    replace(model: M, options?: FindOneAndReplaceOptions): Promise<void | C>;

    update(_id: ObjectId, model: UpdateModel<M>, options?: FindOneAndUpdateOptions): Promise<C | void>;

    updateByQuery(_id: ObjectId, query: UpdateFilter<M>, options?: FindOneAndUpdateOptions): Promise<void | C>;

    delete(_id: ObjectId, options?: DeleteOptions): Promise<boolean>;

    findOne(specification: IMongoSpecification<M>, options?: FindOptions): Promise<C | void>;

    findOneAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: FindOneAndUpdateOptions): Promise<C | void>;

    findOneAndUpdateByQuery(specification: IMongoSpecification<M>, query: UpdateFilter<M>, options?: FindOneAndUpdateOptions): Promise<C | void>;

    findAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateOptions): Promise<void>;

    clean(options?: DeleteOptions): Promise<number>;

    drop(): Promise<boolean>;
}
