import {plainToClass} from 'class-transformer';
import {validate, ValidationError} from 'class-validator';
import {
    Collection,
    Cursor,
    Db,
    DeleteWriteOpResultObject,
    FilterQuery,
    FindAndModifyWriteOpResultObject, IndexSpecification,
    InsertOneWriteOpResult,
    ObjectId, UpdateWriteOpResult,
} from 'mongodb';
import IMongoSpecification from '../specification/IMongoSpecification';
import Repository from './Repository';
import RepositoryValidationError from "../error/RepositoryValidationError";
import {NonFunctionPropertyNames, Omit} from "../util";
import IdSpecification from "../specification/IdSpecification";


interface MetaDate {
    version: number;
    createdAt: string;
    lastUpdateAt: string;
}

export interface Model extends MetaDate {
    id: string;
}

interface MongoEntity {
    _id?: ObjectId;
}

interface BaseEntity extends MetaDate, MongoEntity {
}

export type ModelPropertyNames = NonFunctionPropertyNames<Model>;

export type CreateModel<M extends Model> = Omit<M, ModelPropertyNames>;

export type UpdateModel<M extends Model> = Partial<CreateModel<M>>;

export type Entity<M extends Model> = CreateModel<M> & BaseEntity;


export declare interface ClassType<T> {
    new(...args: any[]): T;
}

export default abstract class MongoRepository<M extends Model> extends Repository<M, FilterQuery<M>, IMongoSpecification<M>> {
    protected constructor(private readonly db: Db) {
        super();
    }

    public createIndexes(indexSpecs: IndexSpecification[]): Promise<void> {
        return this.getCollection()
            .createIndexes(indexSpecs)
            .then(() => {
                return;
            });
    }

    public add(model: CreateModel<M>): Promise<string> {
        return this.validateCreateModel(model)
            .then(() => {
                return this.getCollection().insertOne({
                    version: 0,
                    createdAt: new Date().toISOString(),
                    lastUpdateAt: new Date().toISOString(),
                    ...model,
                });
            })
            .then((result: InsertOneWriteOpResult) => {
                return result.insertedId.toHexString();
            });
    }

    public get(id: string): Promise<M | void> {
        return this.findOne(new IdSpecification(id));
    }

    public replace(model: M): Promise<void | M> {
        const {id, version, lastUpdateAt, createdAt, ...uModel} = model;
        return this.findOneAndUpdate(new IdSpecification(id), uModel);
    }

    public update(id: string, model: UpdateModel<M>): Promise<M | void> {
        return this.findOneAndUpdate(new IdSpecification(id), model);
    }

    public delete(id: string): Promise<boolean> {
        return this.getCollection()
            .deleteOne({_id: new ObjectId(id)})
            .then((result: DeleteWriteOpResultObject) => {
                return !!result.deletedCount;
            });
    }

    public find(
        specification?: IMongoSpecification<M>,
        skip: number = 0,
        limit: number = Infinity,
        sort: Map<string, number> = new Map()
    ): Promise<ReadonlyArray<M>> {
        return this.buildLimit(
            this.buildSkip(this.buildSort(this.buildFind(this.getCollection(), specification), sort), skip),
            limit
        )
            .toArray()
            .then((array: ReadonlyArray<Entity<M>>) => {
                return array.map((entity: Entity<M>) => this.pipe(entity));
            });
    }

    public findOne(specification: IMongoSpecification<M>): Promise<M | void> {
        return this.getCollection()
            .findOne(specification.specified())
            .then((e: M & { _id: ObjectId } | null) => {
                if (e) {
                    return this.pipe(e);
                }
                return;
            });
    }

    public findOneAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>): Promise<M | void> {
        return this.getCollection()
            .findOneAndUpdate(
                specification.specified(),
                {
                    $set: {...model, lastUpdateAt: new Date().toISOString()},
                    $inc: {version: 1},
                },
                {returnOriginal: false}
            )
            .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                if (!result.value) {
                    return;
                }
                return this.pipe(result.value);
            });
    }

    public findAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>): Promise<void> {
        return this.getCollection()
            .updateMany(
                specification.specified(),
                {
                    $set: {...model, lastUpdateAt: new Date().toISOString()},
                    $inc: {version: 1},
                },
            )
            .then(() => {
                return;
            });
    }

    public clean(): Promise<number> {
        return this.getCollection()
            .deleteMany({})
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

    private pipe(entity: Entity<M>): M {
        if (!entity._id) {
            throw new Error('Haven`t _id in object');
        }
        const {_id, ...object} = entity;
        const id = _id.toHexString();
        return plainToClass(this.getClass(), {id, ...object});
    }

    private validateCreateModel(model: CreateModel<M>): Promise<void> {
        return validate(plainToClass(this.getClass(), model)).then((errors: ReadonlyArray<ValidationError>) => {
            if (errors.length) {
                throw new RepositoryValidationError(errors);
            }
            return;
        });
    }

    private validateReplaceModel(model: Omit<M, 'id' | 'version' | 'lastUpdateAt'>): Promise<void> {
        return validate(plainToClass(this.getClass(), model)).then((errors: ReadonlyArray<ValidationError>) => {
            if (errors.length) {
                throw new RepositoryValidationError(errors);
            }
            return;
        });
    }

    private validateUpdateModel(model: UpdateModel<M>): Promise<void> {
        return validate(plainToClass(this.getClass(), model), {skipMissingProperties: true}).then(
            (errors: ReadonlyArray<ValidationError>) => {
                if (errors.length) {
                    throw new RepositoryValidationError(errors);
                }
                return;
            }
        );
    }

    private buildFind(
        collection: Collection<Entity<M>>,
        specification?: IMongoSpecification<M>
    ): Cursor<Entity<M>> {
        if (specification) {
            return this.getCollection().find(specification.specified());
        }
        return this.getCollection().find();
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
