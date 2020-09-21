import IRepository from './IRepository';
import {
    ClientSession,
    CollectionInsertOneOptions, CommonOptions,
    FilterQuery,
    FindOneAndUpdateOption,
    FindOneOptions,
    IndexSpecification, ObjectId, OptionalId, SortOptionObject, UpdateManyOptions, UpdateQuery
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


export default interface IMongoRepository<M extends Model, C> extends IRepository<C, ObjectId, CreateModel<M>, UpdateModel<M>, FilterQuery<M>, IMongoSpecification<M>> {

    find(
        specification?: IMongoSpecification<M>,
        skip?: number,
        limit?: number,
        sort?: { keyOrList: string | Array<[string, number]> | SortOptionObject<M>, direction?: number },
        options?: FindOneOptions<M>
    ): Promise<ReadonlyArray<C>>;

    transaction<T>(cb: (session: ClientSession) => Promise<T>): Promise<T>;

    createIndexes(indexSpecs: IndexSpecification[]): Promise<void>;

    add(model: CreateModel<M>, options?: CollectionInsertOneOptions): Promise<ObjectId>;

    get(_id: ObjectId, options?: FindOneOptions<M>): Promise<C | void>;

    replace(model: M, options?: FindOneAndUpdateOption<M>): Promise<void | C>;

    update(_id: ObjectId, model: UpdateModel<M>, options?: FindOneAndUpdateOption<M>): Promise<C | void>;

    updateByQuery(_id: ObjectId, query: UpdateQuery<M>, options?: FindOneAndUpdateOption<M>): Promise<C | void>;

    delete(_id: ObjectId, options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<boolean>;


    findOne(specification: IMongoSpecification<M>, options?: FindOneOptions<M>): Promise<C | void>;

    findOneAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: FindOneAndUpdateOption<M>): Promise<C | void>;

    findOneAndUpdateByQuery(specification: IMongoSpecification<M>, query: UpdateQuery<M>, options?: FindOneAndUpdateOption<M>): Promise<C | void>;

    findAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateManyOptions): Promise<void>;

    clean(options?: CommonOptions): Promise<number>;

    drop(): Promise<boolean>;
}
