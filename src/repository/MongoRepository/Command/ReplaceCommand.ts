import ICommand from './ICommand';
import { Collection, Filter, FindOneAndReplaceOptions, ModifyResult } from 'mongodb';
import { Model } from '../../IMongoRepository';
import MongoRepository from '../MongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import RepositoryValidationError from '../../../error/RepositoryValidationError';
import { ClassType } from '../../../util';


export default class ReplaceCommand<M extends Model, C> implements ICommand<M, C | void, C> {
    constructor(private model: M, private options?: FindOneAndReplaceOptions) {
    }


    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void | C> {
        if (repositoryOptions.validateReplace) {
            await this.validateReplaceModel(this.model, clazz, repositoryOptions);
        }
        const query: Filter<Model> = { _id: this.model._id };
        return collection
            .findOneAndReplace(
                query,
                this.getReplaceObject(this.model),
                { returnDocument: 'after', ...this.options }
            )
            .then((result: ModifyResult<M>) => {
                if (!result.value) {
                    return;
                }
                return MongoRepository.pipe(result.value, clazz, repositoryOptions);
            });
    }

    private getReplaceObject(model: M) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { _id, ...uModel } = model;
        return {
            ...uModel, lastUpdatedAt: new Date(), version: (model.version || 0) + 1
        };
    }

    private validateReplaceModel(model: M, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void> {
        return validate(plainToClass(clazz, model), repositoryOptions.validatorOptions).then((errors: ReadonlyArray<ValidationError>) => {
            if (errors.length) {
                throw new RepositoryValidationError(errors);
            }
            return;
        });
    }
}
