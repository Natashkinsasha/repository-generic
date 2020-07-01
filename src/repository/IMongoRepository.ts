import IRepository from "./IRepository";
import {
    ClientSession,
    CollectionInsertOneOptions, CommonOptions,
    FilterQuery,
    FindOneAndUpdateOption,
    FindOneOptions,
    IndexSpecification, ObjectId, OptionalId, UpdateManyOptions
} from "mongodb";
import IMongoSpecification from "../specification/IMongoSpecification";
import {Subtract} from "../util";


export interface Model {
    _id: ObjectId;
    version: number;
    createdAt: Date;
    lastUpdatedAt: Date;
}

export type CreateModel<M> = OptionalId<Subtract<M, Model>>;

export type UpdateModel<M> = Partial<CreateModel<M>>;



export default interface IMongoRepository<M extends Model, C> extends IRepository<C, ObjectId, CreateModel<M>, UpdateModel<M>, FilterQuery<M>, IMongoSpecification<M>> {
    transaction<T>(cb: (session: ClientSession) => Promise<T>): Promise<T>;

    createIndexes(indexSpecs: IndexSpecification[]): Promise<void>;

    add(model: CreateModel<M>, options?: CollectionInsertOneOptions): Promise<ObjectId>;

    get(_id: ObjectId, options?: FindOneOptions): Promise<C | void>;

    replace(model: M, options?: FindOneAndUpdateOption): Promise<void | C>;

    update(_id: ObjectId, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<C | void>;

    delete(_id: ObjectId, options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<boolean>;

    find(
        specification?: IMongoSpecification<M>,
        skip?: number,
        limit?: number,
        sort?: Map<string, number>,
        options?: FindOneOptions
    ): Promise<ReadonlyArray<C>>;

    findOne(specification: IMongoSpecification<M>, options?: FindOneOptions): Promise<C | void>;

    findOneAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<C | void>;

    findAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateManyOptions): Promise<void>;

    clean(options?: CommonOptions): Promise<number>;

    drop(): Promise<boolean>;
}
