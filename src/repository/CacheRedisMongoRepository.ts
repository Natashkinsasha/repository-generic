import { Db } from 'mongodb';
import RedisCacheManager from '../cache_manager/RedisCacheManager';
import MongoRepository, { Model, UpdateModel } from './MongoRepository';

export default abstract class CacheRedisMongoRepository<M extends Model> extends MongoRepository<M> {
    protected constructor(db: Db, private redisCacheManage: RedisCacheManager<M>) {
        super(db);
    }

    public get(id: string): Promise<M | void> {
        return this.redisCacheManage.get(id).then((model: M | void) => {
            if (model) {
                return model;
            }
            return super.get(id).then(async (model: M | void) => {
                if (model) {
                    await this.redisCacheManage.save(model);
                }
                return model;
            });
        });
    }

    public replace(model: M): Promise<void | M> {
        return this.redisCacheManage
            .delete(model.id)
            .then(() => {
                return super.replace(model);
            })
            .then(async (model: M | void) => {
                if (model) {
                    await this.redisCacheManage.save(model);
                }
                return model;
            });
    }

    public update(id: string, model: UpdateModel<M>): Promise<M | void> {
        return this.redisCacheManage
            .delete(id)
            .then(() => {
                return super.update(id, model);
            })
            .then(async (model: M | void) => {
                if (model) {
                    await this.redisCacheManage.save(model);
                }
                return model;
            });
    }

    public delete(id: string): Promise<boolean> {
        return this.redisCacheManage.delete(id).then(() => {
            return super.delete(id);
        });
    }
}
