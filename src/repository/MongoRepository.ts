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
import IMongoSpecification from '../specification/IMongoSpecification';
import RepositoryValidationError from "../error/RepositoryValidationError";
import IMongoRepository, {CreateModel, Entity, Model, UpdateModel} from "./IMongoRepository";
import IRepositoryOptions from "./IRepositoryOptions";


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

    public createAdditionalProperty() {
        return Object.entries(this.options)
            .reduce((additionalProperty, [key, value]) => {
                if (key === "version" && value) {
                    return {...additionalProperty, version: 0};
                }
                if (key === "createdAt" && value) {
                    return {...additionalProperty, createdAt: new Date().toISOString()};
                }
                if (key === "lastUpdatedAt" && value) {
                    return {...additionalProperty, lastUpdatedAt: new Date().toISOString()};
                }
                if (key === "softDelete" && value) {
                    return {...additionalProperty, isDeleted: false};
                }
                return additionalProperty;
            }, {});
    }

    public add(model: CreateModel<M>, options?: CollectionInsertOneOptions): Promise<string> {
        return this.validateCreateModel({...model, ...this.createAdditionalProperty()})
            .then(() => {
                return this.getCollection().insertOne({
                    ...this.createAdditionalProperty(),
                    ...model,
                }, options);
            })
            .then((result: InsertOneWriteOpResult) => {
                return result.insertedId.toHexString();
            });
    }

    public get(id: string, options?: FindOneOptions): Promise<M | void> {
        return this.getCollection()
            .findOne({_id: new ObjectId(id)}, options)
            .then((e: M & { _id: ObjectId } | null) => {
                if (e) {
                    return this.pipe(e);
                }
                return;
            });
    }


    private getReplaceObject(model: M) {
        const {version, ...uModel} = {version: 0, ...model};
        return {
            $set: {
                ...uModel, ...Object.entries(this.options)
                    .reduce((additionalProperty, [key, value]) => {
                        if (key === "lastUpdatedAt" && value) {
                            return {...additionalProperty, lastUpdatedAt: new Date().toISOString()};
                        }
                        return additionalProperty;
                    }, {})
            },
            $inc: {
                ...Object.entries(this.options)
                    .reduce((additionalProperty, [key, value]) => {
                        if (key === "version" && value) {
                            return {...additionalProperty, version: 1};
                        }
                        return additionalProperty;
                    }, {})
            },
        };
    }

    public replace(model: M, options?: FindOneAndUpdateOption): Promise<void | M> {
        return this.validateReplaceModel(model)
            .then(() => {
                return this.getCollection()
                    .findOneAndUpdate(
                        {_id: new ObjectId(model.id)},
                        this.getReplaceObject(model),
                        {returnOriginal: false, ...options}
                    )
                    .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                        if (!result.value) {
                            return;
                        }
                        return this.pipe(result.value);
                    });
            });
    }

    private getUpdateObject(model: UpdateModel<M>) {
        const {version, ...uModel} = {version: 0, ...model};
        return {
            $set: {
                ...uModel, ...Object.entries(this.options)
                    .reduce((additionalProperty, [key, value]) => {
                        if (key === "lastUpdatedAt" && value) {
                            return {...additionalProperty, lastUpdatedAt: new Date().toISOString()};
                        }
                        return additionalProperty;
                    }, {})
            },
            $inc: {
                ...Object.entries(this.options)
                    .reduce((additionalProperty, [key, value]) => {
                        if (key === "version" && value) {
                            return {...additionalProperty, version: 1};
                        }
                        return additionalProperty;
                    }, {})
            },
        };
    }


    public update(id: string, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<M | void> {
        return this.validateUpdateModel(model)
            .then(() => {
                return this.getCollection()
                    .findOneAndUpdate(
                        {_id: new ObjectId(id)},
                        this.getUpdateObject(model),
                        {returnOriginal: false, ...options}
                    )
                    .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                        if (!result.value) {
                            return;
                        }
                        return this.pipe(result.value);
                    });
            });
    }

    public delete(id: string, options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<boolean> {
        if (this.options.softDelete) {
            return this.getCollection()
                .findOneAndUpdate(
                    {_id: new ObjectId(id)},
                    {$set: {isDeleted: true}},
                    {returnOriginal: false, ...options}
                )
                .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                    return !!result.value;
                })
        }
        return this.getCollection()
            .deleteOne({_id: new ObjectId(id)}, options)
            .then((result: DeleteWriteOpResultObject) => {
                return !!result.deletedCount;
            });
    }

    public find(
        specification?: IMongoSpecification<M>,
        skip: number = 0,
        limit: number = Infinity,
        sort: Map<string, number> = new Map(),
        options?: FindOneOptions
    ): Promise<ReadonlyArray<M>> {
        return this.buildLimit(
            this.buildSkip(this.buildSort(this.buildFind(this.getCollection(), specification, options), sort), skip),
            limit
        )
            .toArray()
            .then((array: ReadonlyArray<Entity<M>>) => {
                return array.map((entity: Entity<M>) => this.pipe(entity));
            });
    }

    public findOne(specification: IMongoSpecification<M>, options?: FindOneOptions): Promise<M | void> {
        return this.getCollection()
            .findOne(specification.specified())
            .then((e: M & { _id: ObjectId } | null) => {
                if (e) {
                    return this.pipe(e);
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
                return this.pipe(result.value);
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

    private validateReplaceModel(model: M): Promise<void> {
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
        specification?: IMongoSpecification<M>,
        options?: FindOneOptions
    ): Cursor<Entity<M>> {
        return this.getCollection().find(specification || {}, options);
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
