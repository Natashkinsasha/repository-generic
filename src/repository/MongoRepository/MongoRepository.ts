import { plainToClass } from 'class-transformer';
import {
    ClientSession,
    Collection, CollectionInsertOneOptions, CommonOptions,
    Db,
    FindOneAndUpdateOption,
    FindOneOptions,
    IndexSpecification,
    MongoClient,
    UpdateManyOptions,
    ObjectId, UpdateQuery,
} from 'mongodb';
import IMongoSpecification from '../../specification/IMongoSpecification';
import IMongoRepository, { CreateModel, Model, UpdateModel } from '../IMongoRepository';
import IRepositoryOptions from '../IRepositoryOptions';
import AddCommand from './Command/AddCommand';
import GetCommand from './Command/GetCommand';
import ReplaceCommand from './Command/ReplaceCommand';
import UpdateCommand from './Command/UpdateCommand';
import DeleteCommand from './Command/DeleteCommand';
import FindCommand from './Command/FindCommand';
import FindOneCommand from './Command/FindOneCommand';
import FindOneAndUpdateCommand from './Command/FindOneAndUpdateCommand';
import FindAndUpdateCommand from './Command/FindAndUpdateCommand';
import CleanCommand from './Command/CleanCommand';
import TransactionCommand from './Command/TransactionCommand';
import CreateIndexCommand from './Command/CreateIndexCommand';
import { validate, ValidationError } from 'class-validator';
import RepositoryValidationError from '../../error/RepositoryValidationError';
import FindOneAndDeleteCommand from './Command/FindOneAndDeleteCommand';
import UpdateByQueryCommand from './Command/UpdateByQueryCommand';
import FindOneAndUpdateByQueryCommand from './Command/FindOneAndUpdateByQueryCommand';
import { ClassType } from '../../util';


export default abstract class MongoRepository<M extends Model, C> implements IMongoRepository<M, C> {
    private readonly options: IRepositoryOptions<M, C>;

    protected constructor(private readonly db: Db, private client: MongoClient, options: IRepositoryOptions<M, C>) {
        this.options = {
            validateAdd: false,
            validateGet: false,
            validateReplace: false,
            validateUpdate: false,
            validatorOptions: {},
            ...options
        };
    }

    public transaction<T>(cb: (session: ClientSession) => Promise<T>): Promise<T> {
        return new TransactionCommand<M, T, C>(this.client, cb).execute(this.getCollection(), this.getClass(), this.options);
    }

    public createIndexes(indexSpecs: IndexSpecification[]): Promise<void> {
        return new CreateIndexCommand<M, C>(indexSpecs).execute(this.getCollection(), this.getClass(), this.options);
    }

    public add(model: CreateModel<M>, options?: CollectionInsertOneOptions): Promise<ObjectId> {
        return new AddCommand<M, C>(model, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public get(_id: ObjectId, options?: FindOneOptions): Promise<C | void> {
        return new GetCommand<M, C>(_id, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public replace(model: M, options?: FindOneAndUpdateOption): Promise<void | C> {
        return new ReplaceCommand<M, C>(model, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public update(_id: ObjectId, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<C | void> {
        return new UpdateCommand<M, C>(_id, model, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public updateByQuery(_id: ObjectId, query: UpdateQuery<M>, options?: FindOneAndUpdateOption): Promise<void | C> {
        return new UpdateByQueryCommand<M, C>(_id, query, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public delete(_id: ObjectId, options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<boolean> {
        return new DeleteCommand<M, C>(_id, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public find(
        specification?: IMongoSpecification<M>,
        skip: number = 0,
        limit: number = Infinity,
        sort: Map<string, number> = new Map(),
        options?: FindOneOptions
    ): Promise<ReadonlyArray<C>> {
        return new FindCommand<M, C>(specification, skip, limit, sort, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public findOne(specification: IMongoSpecification<M>, options?: FindOneOptions): Promise<C | void> {
        return new FindOneCommand<M, C>(specification, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public findOneAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<C | void> {
        return new FindOneAndUpdateCommand<M, C>(specification, model).execute(this.getCollection(), this.getClass(), this.options);
    }

    public findOneAndUpdateByQuery(specification: IMongoSpecification<M>, query: UpdateQuery<M>, options?: FindOneAndUpdateOption): Promise<C | void> {
        return new FindOneAndUpdateByQueryCommand<M, C>(specification, query).execute(this.getCollection(), this.getClass(), this.options);
    }

    public findAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateManyOptions): Promise<void> {
        return new FindAndUpdateCommand<M, C>(specification, model, options).execute(this.getCollection(), this.getClass(), this.options);
    }

    public findOneAndDelete(specification: IMongoSpecification<M>, options?: FindOneOptions): Promise<C | void> {
        return new FindOneAndDeleteCommand<M, C>(specification, options).execute(this.getCollection(), this.getClass(), this.options);
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

    protected getCollection<M extends Model>(): Collection<M> {
        return this.db.collection(this.getCollectionName());
    }

    public static async pipe<M extends Model, C>(entity: M, clazz: ClassType<M>, options: IRepositoryOptions<M, C>): Promise<C> {
        const object: M = plainToClass<M, M>(clazz, entity, options.classTransformOptions);
        if (options.validateGet) {
            await validate(object, options.validatorOptions)
                .then((errors: ReadonlyArray<ValidationError>) => {
                    if (errors.length) {
                        throw new RepositoryValidationError(errors);
                    }
                    return;
                });
        }
        return options.customTransform(entity);
    }
}
