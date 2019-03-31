import {CommonOptions, Db, FindOneAndUpdateOption, FindOneOptions, MongoClient, UpdateManyOptions} from 'mongodb';
import {UpdateModel} from './IMongoRepository';
import MongoRepository from "./MongoRepository/MongoRepository";
import IRepositoryOptions from "./IRepositoryOptions";
import ICacheManager from "../cache_manager/ICacheManager";
import IMongoSpecification from "../specification/IMongoSpecification";

export default abstract class CacheMongoRepository<M extends { id: string }> extends MongoRepository<M> {
    protected constructor(db: Db, client: MongoClient, private cacheManage: ICacheManager<M>, options?: Partial<IRepositoryOptions>) {
        super(db, client, options);
    }

    public get(id: string, options?: FindOneOptions): Promise<M | void> {
        if (options && options.session) {
            return super.get(id, options).then(async (model: M | void) => {
                if (model) {
                    await this.cacheManage.save(model);
                }
                return model;
            });
        }
        return this.cacheManage.get(id).then((model: M | void) => {
            if (model) {
                return model;
            }
            return super.get(id, options).then(async (model: M | void) => {
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
            .delete(model.id)
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

    public update(id: string, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<M | void> {
        return this.cacheManage
            .delete(id)
            .then(() => {
                return super.update(id, model, options);
            })
            .then(async (model: M | void) => {
                if (model) {
                    await this.cacheManage.save(model);
                }
                return model;
            });
    }

    public delete(id: string, options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<boolean> {
        return this.cacheManage.delete(id).then(() => {
            return super.delete(id, options);
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
