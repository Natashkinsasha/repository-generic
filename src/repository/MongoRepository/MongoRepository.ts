import {plainToClass} from 'class-transformer';
import {
    ClientSession,
    Collection, CollectionInsertOneOptions, CommonOptions,
    Db,
    FindOneAndUpdateOption,
    FindOneOptions,
    IndexSpecification,
    MongoClient,
    UpdateManyOptions,
} from 'mongodb';
import IMongoSpecification from '../../specification/IMongoSpecification';
import IMongoRepository, {CreateModel, Entity, UpdateModel} from "../IMongoRepository";
import IRepositoryOptions from "../IRepositoryOptions";
import AddCommand from "./Command/AddCommand";
import GetCommand from "./Command/GetCommand";
import ReplaceCommand from "./Command/ReplaceCommand";
import UpdateCommand from "./Command/UpdateCommand";
import DeleteCommand from "./Command/DeleteCommand";
import FindCommand from "./Command/FindCommand";
import FindOneCommand from "./Command/FindOneCommand";
import FindOneAndUpdateCommand from "./Command/FindOneAndUpdateCommand";
import FindAndUpdateCommand from "./Command/FindAndUpdateCommand";
import CleanCommand from "./Command/CleanCommand";
import TransactionCommand from "./Command/TransactionCommand";
import CreateIndexCommand from "./Command/CreateIndexCommand";


export declare interface ClassType<T> {
    new(...args: any[]): T;
}


export default abstract class MongoRepository<M extends { id: string }> implements IMongoRepository<M> {

    private readonly options: IRepositoryOptions;

    protected constructor(private readonly db: Db, private client: MongoClient, options: Partial<IRepositoryOptions> = {}) {
        this.options = {version: false, createdAt: false, lastUpdatedAt: false, softDelete: false, validate: false, ...options};
    }

    public transaction<T>(cb: (session: ClientSession) => Promise<T>): Promise<T> {
        return new TransactionCommand(this.client, cb).execute(this.getCollection(), this.getClass(), this.options);
    }

    public createIndexes(indexSpecs: IndexSpecification[]): Promise<void> {
        return new CreateIndexCommand(indexSpecs).execute(this.getCollection(), this.getClass(), this.options);
    }



    public add(model: CreateModel<M>, options?: CollectionInsertOneOptions): Promise<string> {
        return new AddCommand<M>(model, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public get(id: string, options?: FindOneOptions): Promise<M | void> {
        return new GetCommand<M>(id, options).execute(this.getCollection(), this.getClass(), this.options);
    }



    public replace(model: M, options?: FindOneAndUpdateOption): Promise<void | M> {
        return new ReplaceCommand(model, options).execute(this.getCollection(), this.getClass(), this.options);
    }



    public update(id: string, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<M | void> {
        return new UpdateCommand(id, model, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public delete(id: string, options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<boolean> {
        return new DeleteCommand(id, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public find(
        specification?: IMongoSpecification<M>,
        skip: number = 0,
        limit: number = Infinity,
        sort: Map<string, number> = new Map(),
        options?: FindOneOptions
    ): Promise<ReadonlyArray<M>> {
        return new FindCommand(specification, skip, limit, sort, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public findOne(specification: IMongoSpecification<M>, options?: FindOneOptions): Promise<M | void> {
        return new FindOneCommand(specification, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public findOneAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<M | void> {
        return new FindOneAndUpdateCommand(specification, model).execute(this.getCollection(), this.getClass(), this.options);
    }

    public findAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateManyOptions): Promise<void> {
        return new FindAndUpdateCommand(specification, model, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public clean(options?: CommonOptions): Promise<number> {
        return new CleanCommand(options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public drop(): Promise<boolean> {
        return this.db.dropCollection(this.getCollectionName());
    }

    protected abstract getClass(): ClassType<M>;

    protected getCollectionName(): string {
        return this.constructor.name.toLowerCase().split('repository')[0];
    }

    protected getCollection = (): Collection<Entity<M>> => {
        return this.db.collection(this.getCollectionName());
    };

    public static pipe<M>(entity: Entity<M>, clazz: ClassType<M>): M {
        if (!entity._id) {
            throw new Error('Haven`t _id in object');
        }
        const {_id, ...object} = entity;
        const id = _id.toHexString();
        return plainToClass(clazz, {id, ...object});
    }

}
