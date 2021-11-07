import ICommand from './ICommand';
import {
    Collection, Filter, FindOneAndUpdateOptions, ModifyResult,
    ObjectId, UpdateFilter,
} from 'mongodb';
import MongoRepository from '../MongoRepository';
import { Model, UpdateModel } from '../../IMongoRepository';
import IRepositoryOptions from '../../IRepositoryOptions';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import RepositoryValidationError from '../../../error/RepositoryValidationError';
import { ClassType } from '../../../util';


export default class UpdateCommand<M extends Model, C> implements ICommand<M, C | void, C> {
    constructor(private _id: ObjectId, private model: UpdateModel<M>, private options?: FindOneAndUpdateOptions) {
    }


    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M, C>): Promise<void | C> {
        if (repositoryOptions.validateUpdate) {
            await this.validateUpdateModel(this.model, clazz);
        }
        const filter: Filter<Model> = { _id: this._id };
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
                return MongoRepository.pipe(result.value, clazz, repositoryOptions);
            });
    }

    private validateUpdateModel(model: UpdateModel<M>, clazz: ClassType<M>): Promise<void> {
        return validate(plainToClass(clazz, model), { skipUndefinedProperties: true }).then(
            (errors: ReadonlyArray<ValidationError>) => {
                if (errors.length) {
                    throw new RepositoryValidationError(errors);
                }
                return;
            }
        );
    }
}
