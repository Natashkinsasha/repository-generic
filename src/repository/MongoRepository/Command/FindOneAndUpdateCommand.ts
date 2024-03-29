import ICommand from './ICommand';
import { Collection, FindOneAndUpdateOptions, ModifyResult, UpdateFilter } from 'mongodb';
import { Model, UpdateModel } from '../../IMongoRepository';
import MongoRepository from '../MongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import IMongoSpecification from '../../../specification/IMongoSpecification';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import RepositoryValidationError from '../../../error/RepositoryValidationError';
import { ClassType, pipe } from '../../../util';


export default class FindOneAndUpdateCommand<M extends Model, C> implements ICommand<M, C | void, C> {
    constructor(private readonly specification: IMongoSpecification<M>, private readonly model: UpdateModel<M>, private readonly options?: FindOneAndUpdateOptions) {}

    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void | C> {
        if (repositoryOptions.validateUpdate) {
            await this.validateUpdateModel({ ...this.model, lastUpdatedAt: new Date() }, clazz, repositoryOptions);
        }
        const filter = this.specification.specified();
        const update: UpdateFilter<Model> = {
            $set: { ...this.model, lastUpdatedAt: new Date() },
            $inc: { version: 1 },
        };
        return collection
            .findOneAndUpdate(
                filter,
                update,
                { returnDocument: 'after', ...this.options }
            )
            .then((result: ModifyResult<M>) => {
                if (!result.value) {
                    return;
                }
                return pipe(result.value, clazz, repositoryOptions);
            });
    }

    private validateUpdateModel(model: UpdateModel<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void> {
        return validate(plainToClass(clazz, model), { ...repositoryOptions.validatorOptions, skipMissingProperties: true }).then(
            (errors: ReadonlyArray<ValidationError>) => {
                if (errors.length) {
                    throw new RepositoryValidationError(errors);
                }
                return;
            }
        );
    }
}
