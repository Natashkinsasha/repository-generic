import {CommonOptions, Db, FindOneAndUpdateOption, FindOneOptions, MongoClient} from 'mongodb';
import RedisCacheManager from '../cache_manager/RedisCacheManager';
import { Model, UpdateModel } from './IMongoRepository';
import MongoRepository from "./MongoRepository";
import IRepositoryOptions from "./IRepositoryOptions";

export default abstract class CacheRedisMongoRepository<M extends { id: string }> extends MongoRepository<M> {
    protected constructor(db: Db, client: MongoClient, private redisCacheManage: RedisCacheManager<M>, options?: Partial<IRepositoryOptions>) {
        super(db, client, options);
    }

    public get(id: string, options?: FindOneOptions): Promise<M | void> {
        if(options && options.session){
            return super.get(id, options).then(async (model: M | void) => {
                if (model) {
                    await this.redisCacheManage.save(model);
                }
                return model;
            });
        }
        return this.redisCacheManage.get(id).then((model: M | void) => {
            if (model) {
                return model;
            }
            return super.get(id, options).then(async (model: M | void) => {
                if (model) {
                    await this.redisCacheManage.save(model);
                }
                return model;
            });
        });
    }

    public replace(model: M, options?: FindOneAndUpdateOption): Promise<void | M> {
        return this.redisCacheManage
            .delete(model.id)
            .then(() => {
                return super.replace(model, options);
            })
            .then(async (model: M | void) => {
                if (model) {
                    await this.redisCacheManage.save(model);
                }
                return model;
            });
    }

    public update(id: string, model: UpdateModel<M>, options?: FindOneAndUpdateOption): Promise<M | void> {
        return this.redisCacheManage
            .delete(id)
            .then(() => {
                return super.update(id, model, options);
            })
            .then(async (model: M | void) => {
                if (model) {
                    await this.redisCacheManage.save(model);
                }
                return model;
            });
    }

    public delete(id: string, options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<boolean> {
        return this.redisCacheManage.delete(id).then(() => {
            return super.delete(id, options);
        });
    }
}
