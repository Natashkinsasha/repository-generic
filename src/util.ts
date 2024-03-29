import { Model } from './repository/IMongoRepository';
import { ObjectId } from 'mongodb';
import { ExposeOptions, plainToClass, Transform } from 'class-transformer';
import IRepositoryOptions from './repository/IRepositoryOptions';
import { validate, ValidationError } from 'class-validator';
import RepositoryValidationError from './error/RepositoryValidationError';

export type NonFunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Diff<T, U> = T extends U ? never : T;
export type Subtract<T, V> = Pick<T, Exclude<keyof T, keyof V>>;
export type Object<M> = Subtract<M & {id: string}, {_id: ObjectId}>;

export interface ClassType<T> {
    new(...args: any[]): T;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ExposeId = (options?: ExposeOptions) =>
    ((target: Record<string, any>, propertyKey: string) => {
        Transform((_, obj) => obj[propertyKey])(target, propertyKey);
    });

export async function pipe<M extends Model, C>(entity: M, clazz: ClassType<M>, options: IRepositoryOptions<M, C>): Promise<C> {
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
return options.customTransform(object);
}
