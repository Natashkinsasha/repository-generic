import { plainToClass } from 'class-transformer';
import {
    ClientSession,
    Collection,
    Db, DeleteOptions,
    FindOneAndDeleteOptions,
    FindOneAndReplaceOptions,
    FindOneAndUpdateOptions,
    FindOptions,
    IndexDescription,
    InsertOneOptions,
    MongoClient,
    ObjectId, Sort, SortDirection, UpdateFilter, UpdateOptions,
} from 'mongodb';
import IMongoSpecification from '../../specification/IMongoSpecification';
import { CreateModel, Model, UpdateModel } from '../IMongoRepository';
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


function createMongoRepository<M extends Model, C>(clazz: ClassType<M>) {
    return class {
        private readonly options: IRepositoryOptions<M, C>;
        private readonly db: Db;

        protected constructor(private client: MongoClient, options: IRepositoryOptions<M, C>) {
            this.options = {
                validateAdd: false,
                validateGet: false,
                validateReplace: false,
                validateUpdate: false,
                validatorOptions: {},
                ...options
            };
            this.db = client.db(this.getDbName());
        }

        public transaction<T>(cb: (session: ClientSession) => Promise<T>): Promise<T> {
            return new TransactionCommand<M, T, C>(this.client, cb).execute(this.getCollection(), this.getClass(), this.options);
        }

        public createIndexes(indexSpecs: IndexDescription[]): Promise<void> {
            return new CreateIndexCommand<M, C>(indexSpecs).execute(this.getCollection(), this.getClass(), this.options);
        }

        public add(model: CreateModel<M>, options?: InsertOneOptions): Promise<ObjectId> {
            return new AddCommand<M, C>(model, options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public get(_id: ObjectId, options?: FindOptions<M>): Promise<C | void> {
            return new GetCommand<M, C>(_id, options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public replace(model: M, options?: FindOneAndReplaceOptions): Promise<void | C> {
            return new ReplaceCommand<M, C>(model, options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public update(_id: ObjectId, model: UpdateModel<M>, options?: FindOneAndUpdateOptions): Promise<C | void> {
            return new UpdateCommand<M, C>(_id, model, options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public updateByQuery(_id: ObjectId, query: UpdateFilter<M>, options?: FindOneAndUpdateOptions): Promise<void | C> {
            return new UpdateByQueryCommand<M, C>(_id, query, options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public delete(_id: ObjectId, options?: DeleteOptions): Promise<boolean> {
            return new DeleteCommand<M, C>(_id, options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public find(
            specification?: IMongoSpecification<M>,
            // eslint-disable-next-line default-param-last
            skip: number = 0,
            // eslint-disable-next-line default-param-last
            limit: number = Infinity,
            sort?: { sort: Sort | string, direction?: SortDirection },
            options?: FindOptions
        ): Promise<ReadonlyArray<C>> {
            return new FindCommand<M, C>(specification, skip, limit, sort, options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public findOne(specification: IMongoSpecification<M>, options?: FindOptions): Promise<C | void> {
            return new FindOneCommand<M, C>(specification, options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public findOneAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: FindOneAndUpdateOptions): Promise<C | void> {
            return new FindOneAndUpdateCommand<M, C>(specification, model, options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public findOneAndUpdateByQuery(specification: IMongoSpecification<M>, query: UpdateFilter<M>, options?: FindOneAndUpdateOptions): Promise<C | void> {
            return new FindOneAndUpdateByQueryCommand<M, C>(specification, query, options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public findAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateOptions): Promise<void> {
            return new FindAndUpdateCommand<M, C>(specification, model, options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public findOneAndDelete(specification: IMongoSpecification<M>, options?: FindOneAndDeleteOptions): Promise<C | void> {
            return new FindOneAndDeleteCommand<M, C>(specification, options).execute(this.getCollection(), this.getClass(), this.options);
        }


        public clean(options?: DeleteOptions): Promise<number> {
            return new CleanCommand(options).execute(this.getCollection(), this.getClass(), this.options);
        }

        public drop(): Promise<boolean> {
            return this.db.dropCollection(this.getCollectionName());
        }


        protected getCollectionName(): string {
            return this.constructor.name.toLowerCase().split('repository')[0];
        }

        protected getCollection<M extends Model>(): Collection<M> {
            return this.db.collection(this.getCollectionName());
        }


        protected getDbName(): string {
            throw new Error(`Db name is not defined for ${ clazz.name}`);
        }

        protected getClass(): ClassType<M> {
            return clazz;
        }
    };
}


export default <M extends Model, C>(clazz: ClassType<M>) => {
    return createMongoRepository<M, C>(clazz);
};
