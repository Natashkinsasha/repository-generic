import { classToPlain, plainToClass } from 'class-transformer';
import { RedisClient } from 'redis';
import ICacheManager from './ICacheManager';
import { ClassType } from '../util';

export default abstract class RedisCacheManager<T> implements ICacheManager<T> {
    constructor(private readonly redisClient: RedisClient) {
    }

    protected abstract getId(object: T): Promise<string>;

    public delete(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            return this.redisClient.del(`${this.getCollectionName()}:${id}`, (err: Error | null) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    public get(id: string): Promise<T | void> {
        return new Promise((resolve, reject) => {
            return this.redisClient.get(`${this.getCollectionName()}:${id}`, (err: Error | null, json?: string) => {
                if (err) {
                    return reject(err);
                }
                if (json) {
                    const object: Partial<T> = JSON.parse(json);
                    return resolve(plainToClass(this.getClass(), object));
                }
                return resolve();
            });
        });
    }

    public save(object: T): Promise<T> {
        return new Promise((resolve, reject) => {
            return this.redisClient.set(
                `${this.getCollectionName()}:${this.getId(object)}`,
                JSON.stringify(classToPlain(object)),
                (err: Error | null) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(object);
                }
            );
        });
    }

    public deleteAll(): Promise<void> {
        const key = `${this.getCollectionName()}:*`;
        return new Promise((resolve, reject) => {
            return this.redisClient.keys(key, (err: Error | null, keys: string[]) => {
                if (err) {
                    return reject(err);
                }
                return Promise
                    .all(keys.map((key: string) => (this.delete(key))))
                    .then(() => {
                        return resolve();
                    })
                    .catch(reject);
            });
        });
    }

    protected abstract getClass(): ClassType<T>;

    protected getCollectionName(): string {
        return this.constructor.name.toLowerCase().split('rediscachemanager')[0];
    }
}
