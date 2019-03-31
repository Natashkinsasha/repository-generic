import IRepository from "./IRepository";
import {
    ClientSession,
    CollectionInsertOneOptions, CommonOptions,
    FilterQuery,
    FindOneAndUpdateOption,
    FindOneOptions,
    IndexSpecification, ObjectId, UpdateManyOptions
} from "mongodb";
import IMongoSpecification from "../specification/IMongoSpecification";
import {Subtract} from "../util";


export interface Model {
    id: string;
    version: number;
    createdAt: string;
    lastUpdatedAt: string;
    isDeleted: boolean;
}

export type CreateModel<M> = Subtract<M, Model>;

export type UpdateModel<M> = Partial<CreateModel<M>>;

export type Entity<M> = CreateModel<M> & { _id?: ObjectId };


export default interface IMongoRepository<M> extends IRepository<M, FilterQuery<M>, IMongoSpecification<M>> {
    transaction<T>(cb: (session: ClientSession) => Promise<T>): Promise<T>;

    createIndexes(indexSpecs: IndexSpecification[]): Promise<void>;

    add(model: CreateModel<M>, options?: CollectionInsertOneOptions): Promise<string>;

    get(id: string, options?: FindOneOptions): Promise<M | void>;

    replace(model: M, options?: FindOneAndUpdateOption): Promise<void | M>;

    update(id: string, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<M | void>;

    delete(id: string, options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<boolean>;

    find(
        specification?: IMongoSpecification<M>,
        skip?: number,
        limit?: number,
        sort?: Map<string, number>,
        options?: FindOneOptions
    ): Promise<ReadonlyArray<M>>;

    findOne(specification: IMongoSpecification<M>, options?: FindOneOptions): Promise<M | void>;

    findOneAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<M | void>;

    findAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateManyOptions): Promise<void>;

    clean(options?: CommonOptions): Promise<number>;

    drop(): Promise<boolean>;
}