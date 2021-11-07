import ICommand from './ICommand';
import { CreateModel, Model } from '../../IMongoRepository';
import { Collection, InsertOneOptions, OptionalId, ObjectId } from 'mongodb';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import RepositoryValidationError from '../../../error/RepositoryValidationError';
import IRepositoryOptions from '../../IRepositoryOptions';
import { ClassType } from '../../../util';


export default class AddCommand<M extends Model, C> implements ICommand<M, ObjectId, C> {
    constructor(private readonly model: CreateModel<M>, private readonly options?: InsertOneOptions) {

    }

    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<ObjectId> {
        const model: any = { ...this.model, ...AddCommand.createAdditionalProperty() };
        if (repositoryOptions.validateAdd) {
            await this.validateCreateModel(model, clazz, repositoryOptions);
        }
        return collection.insertOne(model, this.options ?? {})
            .then((result) => {
                return result.insertedId as ObjectId;
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
