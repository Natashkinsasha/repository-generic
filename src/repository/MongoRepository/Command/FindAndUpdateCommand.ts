import ICommand from './ICommand';
import { Collection, UpdateFilter, UpdateOptions } from 'mongodb';
import IRepositoryOptions from '../../IRepositoryOptions';
import { Model, UpdateModel } from '../../IMongoRepository';
import IMongoSpecification from '../../../specification/IMongoSpecification';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import RepositoryValidationError from '../../../error/RepositoryValidationError';
import { ClassType } from '../../../util';


export default class FindAndUpdateCommand<M extends Model, C>implements ICommand<M, void, C> {
    constructor(private specification: IMongoSpecification<M>, private model: UpdateModel<M>, private options?: UpdateOptions) {

    }

    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void> {
        const query = this.specification.specified();
        if (repositoryOptions.validateUpdate) {
            await this.validateUpdateModel({ ...this.model, lastUpdatedAt: new Date() }, clazz, repositoryOptions);
        }
        const update: UpdateFilter<Model> = {
            $set: { ...this.model, lastUpdatedAt: new Date() },
            $inc: { version: 1 },
        };
        return collection
            .updateMany(
                query,
                update,
                this.options ?? {},
            )
            .then(() => {
                return;
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
