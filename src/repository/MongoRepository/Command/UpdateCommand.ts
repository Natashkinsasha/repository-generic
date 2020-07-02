import ICommand from "./ICommand";
import {
    Collection,
    FilterQuery,
    FindAndModifyWriteOpResultObject,
    FindOneAndUpdateOption,
    ObjectId,
    UpdateQuery
} from "mongodb";
import MongoRepository, {ClassType} from "../MongoRepository";
import {Model, UpdateModel} from "../../IMongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import {validate, ValidationError} from "class-validator";
import {plainToClass} from "class-transformer";
import RepositoryValidationError from "../../../error/RepositoryValidationError";


export default class UpdateCommand<M extends Model, C> implements ICommand<M, C | void, C> {


    constructor(private _id: ObjectId, private  model: UpdateModel<M>, private options?: FindOneAndUpdateOption) {
    }


    public async execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M,C>): Promise<void | C> {
        if (repositoryOptions.validateUpdate) {
            await this.validateUpdateModel(this.model, clazz)
        }
        const filter: FilterQuery<Model> = {_id: this._id};
        const update: UpdateQuery<Model> = {
            $set: {...this.model, lastUpdatedAt: new Date()},
            $inc: {version: 1},
        };
        return collection
            .findOneAndUpdate(
                filter,
                update,
                {returnOriginal: false, ...this.options}
            )
            .then(async (result: FindAndModifyWriteOpResultObject<M>) => {
                if (!result.value) {
                    return;
                }
                return await MongoRepository.pipe(result.value, clazz, repositoryOptions);
            });
    }

    private validateUpdateModel(model: UpdateModel<M>, clazz: ClassType<M>): Promise<void> {
        return validate(plainToClass(clazz, model), {skipMissingProperties: true}).then(
            (errors: ReadonlyArray<ValidationError>) => {
                if (errors.length) {
                    throw new RepositoryValidationError(errors);
                }
                return;
            }
        );
    }

}
