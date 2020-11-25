import ICommand from './ICommand';
import { CreateModel, Model } from '../../IMongoRepository';
import { Collection, CollectionInsertOneOptions, OptionalId, ObjectId } from 'mongodb';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import RepositoryValidationError from '../../../error/RepositoryValidationError';
import IRepositoryOptions from '../../IRepositoryOptions';
import { ClassType } from '../../../util';
import MongoRepository from "../MongoRepository";


export default class AddCommand<M extends Model, C> implements ICommand<M, C, C> {
    constructor(private readonly model: CreateModel<M>, private readonly options?: CollectionInsertOneOptions) {

    }

    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<C> {
        const model: any = { ...this.model, ...AddCommand.createAdditionalProperty() };
        if (repositoryOptions.validateAdd) {
            await this.validateCreateModel(model, clazz, repositoryOptions);
        }
        return collection.insertOne(model, this.options)
            .then((result) => {
                const entity = result.ops[0] as M;
                if(!entity){
                    throw new Error('Mongo insert error');
                }
                return MongoRepository.pipe(entity, clazz, repositoryOptions);
            });
    }

    private validateCreateModel(model: OptionalId<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void> {
        return validate(plainToClass(clazz, model), repositoryOptions.validatorOptions)
            .then((errors: ReadonlyArray<ValidationError>) => {
                if (errors.length) {
                    throw new RepositoryValidationError(errors);
                }
                return;
            });
    }

    private static createAdditionalProperty(): OptionalId<Model> {
        return {
            version: 0,
            createdAt: new Date(),
            lastUpdatedAt: new Date()
        };
    }
}
