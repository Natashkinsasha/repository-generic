import {CommonOptions, Db, FindOneAndUpdateOption, FindOneOptions, MongoClient, UpdateManyOptions, ObjectId} from 'mongodb';
import {Model, UpdateModel} from './IMongoRepository';
import MongoRepository from "./MongoRepository/MongoRepository";
import IRepositoryOptions from "./IRepositoryOptions";
import ICacheManager from "../cache_manager/ICacheManager";
import IMongoSpecification from "../specification/IMongoSpecification";

export default abstract class CacheMongoRepository<M  extends Model> extends MongoRepository<M> {
    protected constructor(db: Db, client: MongoClient, private cacheManage: ICacheManager<M>, options?: Partial<IRepositoryOptions>) {
        super(db, client, options);
    }

    public get(_id: ObjectId, options?: FindOneOptions): Promise<M | void> {
        if (options && options.session) {
            return super.get(_id, options).then(async (model: M | void) => {
                if (model) {
                    await this.cacheManage.save(model);
                }
                return model;
            });
        }
        return this.cacheManage.get(_id.toHexString()).then((model: M | void) => {
            if (model) {
                return model;
            }
            return super.get(_id, options).then(async (model: M | void) => {
                if (model) {
                    await this.cacheManage.save(model);
                }
                return model;
            });
        });
    }

    public findAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateManyOptions): Promise<void>{
        return this.cacheManage.deleteAll()
            .then(() => {
                return super.findAndUpdate(specification, model, options);
            });
    }

    public findOneAndUpdate(specification: IMongoSpecification<M>, model: UpdateModel<M>, options?: UpdateManyOptions): Promise<M | void>{
        return super.findOneAndUpdate(specification, model, options)
            .then(async (model: M | void)=>{
                if(model){
                    await this.cacheManage.save(model);
                    return model;
                }
                return;
            })
    }

    public replace(model: M, options?: FindOneAndUpdateOption): Promise<void | M> {
        return this.cacheManage
            .delete(model._id.toHexString())
            .then(() => {
                return super.replace(model, options);
            })
            .then(async (model: M | void) => {
                if (model) {
                    await this.cacheManage.save(model);
                }
                return model;
            });
    }

    public update(_id: ObjectId, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<M | void> {
        return this.cacheManage
            .delete(_id.toHexString())
            .then(() => {
                return super.update(_id, model, options);
            })
            .then(async (model: M | void) => {
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
