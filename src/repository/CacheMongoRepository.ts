import { CommonOptions, Db, FindOneAndUpdateOption, FindOneOptions, MongoClient, UpdateManyOptions, ObjectId } from 'mongodb';
import { ICacheManager, IMongoSpecification, IRepositoryOptions, Model, MongoRepository, UpdateModel } from '../index';

export default abstract class CacheMongoRepository<M extends Model, C> extends MongoRepository<M, C> {
    protected constructor(db: Db, client: MongoClient, private cacheManage: ICacheManager<C>, options: IRepositoryOptions<M, C>) {
        super(db, client, options);
    }

    public get(_id: ObjectId, options?: FindOneOptions): Promise<C | void> {
        if (options && options.session) {
            return super.get(_id, options).then(async (model: C | void) => {
                if (model) {
                    await this.cacheManage.save(model);
                }
                return model;
            });
        }
        return this.cacheManage.get(_id.toHexString()).then((model: C | void) => {
            if (model) {
                return model;
            }
            return super.get(_id, options).then(async (model: C | void) => {
                if (model) {
                    await this.cacheManage.save(model);
                }
                return model;
            });
        });
    }

    public findAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateManyOptions): Promise<void> {
        return this.cacheManage.deleteAll()
            .then(() => {
                return super.findAndUpdate(specification, model, options);
            });
    }

    public findOneAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateManyOptions): Promise<C | void> {
        return super.findOneAndUpdate(specification, model, options)
            .then(async (model: C | void) => {
                if (model) {
                    await this.cacheManage.save(model);
                    return model;
                }
                return;
            });
    }

    public replace(model: M, options?: FindOneAndUpdateOption): Promise<void | C> {
        return this.cacheManage
            .delete(model._id.toHexString())
            .then(() => {
                return super.replace(model, options);
            })
            .then(async (model: C | void) => {
                if (model) {
                    await this.cacheManage.save(model);
                }
                return model;
            });
    }

    public update(_id: ObjectId, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<C | void> {
        return this.cacheManage
            .delete(_id.toHexString())
            .then(() => {
                return super.update(_id, model, options);
            })
            .then(async (model: C | void) => {
                if (model) {
                    await this.cacheManage.save(model);
                }
                return model;
            });
    }

    public delete(_id: ObjectId, options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<boolean> {
        return this.cacheManage.delete(_id.toHexString()).then(() => {
            return super.delete(_id, options);
        });
    }

    public drop(): Promise<boolean> {
        return this.cacheManage.deleteAll()
            .then(() => {
                return super.drop();
            });
    }

    public clean(options?: CommonOptions): Promise<number> {
        return this.cacheManage.deleteAll()
            .then(() => {
                return super.clean(options);
            });
    }
}
