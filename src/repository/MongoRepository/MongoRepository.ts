import {plainToClass} from 'class-transformer';
import {validate, ValidationError} from 'class-validator';
import {
    ClientSession,
    Collection, CollectionInsertOneOptions, CommonOptions,
    Cursor,
    Db,
    DeleteWriteOpResultObject,
    FindAndModifyWriteOpResultObject, FindOneAndUpdateOption, FindOneOptions, IndexSpecification,
    InsertOneWriteOpResult, MongoClient,
    ObjectId, UpdateManyOptions,
} from 'mongodb';
import IMongoSpecification from '../../specification/IMongoSpecification';
import RepositoryValidationError from "../../error/RepositoryValidationError";
import IMongoRepository, {CreateModel, Entity, Model, UpdateModel} from "../IMongoRepository";
import IRepositoryOptions from "../IRepositoryOptions";
import ICommand from "./Command/ICommand";
import AddCommand from "./Command/AddCommand";
import GetCommand from "./Command/GetCommand";
import ReplaceCommand from "./Command/ReplaceCommand";
import UpdateCommand from "./Command/UpdateCommand";
import DeleteCommand from "./Command/DeleteCommand";
import FindCommand from "./Command/FindCommand";


export declare interface ClassType<T> {
    new(...args: any[]): T;
}


export default abstract class MongoRepository<M extends { id: string }> implements IMongoRepository<M> {

    private readonly options: IRepositoryOptions;

    protected constructor(private readonly db: Db, private client: MongoClient, options: Partial<IRepositoryOptions> = {}) {
        this.options = {version: false, createdAt: false, lastUpdatedAt: false, softDelete: false, ...options};
    }

    public transaction<T>(cb: (session: ClientSession) => Promise<T>): Promise<T> {
        const session = this.client.startSession();
        session.startTransaction();
        return cb(session)
            .then((result: T) => {
                return session.commitTransaction()
                    .then(() => {
                        return result;
                    });
            }, (err: Error) => {
                return session.abortTransaction()
                    .then(() => {
                        throw err;
                    })
            });
    }

    public createIndexes(indexSpecs: IndexSpecification[]): Promise<void> {
        return this.getCollection()
            .createIndexes(indexSpecs)
            .then(() => {
                return;
            });
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
        return this.getCollection()
            .findOne(specification.specified())
            .then((e: M & { _id: ObjectId } | null) => {
                if (e) {
                    return MongoRepository.pipe(e, this.getClass());
                }
                return;
            });
    }

    public findOneAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<M | void> {
        return this.getCollection()
            .findOneAndUpdate(
                specification.specified(),
                {
                    $set: {...model, lastUpdatedAt: new Date().toISOString()},
                    $inc: {version: 1},
                },
                {returnOriginal: false, ...options}
            )
            .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                if (!result.value) {
                    return;
                }
                return MongoRepository.pipe(result.value, this.getClass());
            });
    }

    public findAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateManyOptions): Promise<void> {
        return this.getCollection()
            .updateMany(
                specification.specified(),
                {
                    $set: {...model, lastUpdatedAt: new Date().toISOString()},
                    $inc: {version: 1},
                },
                options,
            )
            .then(() => {
                return;
            });
    }

    public clean(options?: CommonOptions): Promise<number> {
        return this.getCollection()
            .deleteMany({}, options)
            .then((resultObject: DeleteWriteOpResultObject) => {
                return resultObject.result.n || 0;
            });
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
