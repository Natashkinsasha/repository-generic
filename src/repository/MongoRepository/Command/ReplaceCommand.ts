import ICommand from "./ICommand";
import {Collection, FilterQuery, FindAndModifyWriteOpResultObject, FindOneAndUpdateOption, ObjectId} from "mongodb";
import {Model} from "../../IMongoRepository";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import {validate, ValidationError} from "class-validator";
import {plainToClass} from "class-transformer";
import RepositoryValidationError from "../../../error/RepositoryValidationError";


export default class ReplaceCommand<M extends Model> implements ICommand<M, M | void> {


    constructor(private model: M, private options?: FindOneAndUpdateOption) {
    }


    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void | M> {
        return Promise
            .resolve()
            .then(async () => {
                if (repositoryOptions.validateReplace) {
                    await this.validateReplaceModel(this.model, clazz, repositoryOptions)
                }
                const query: FilterQuery<Model> = {_id: this.model._id};
                return collection
                    .findOneAndReplace(
                        query,
                        this.getReplaceObject(this.model),
                        {returnOriginal: false, ...this.options}
                    );
            })
            .then(async (result: FindAndModifyWriteOpResultObject<M>) => {
                if (!result.value) {
                    return;
                }
                return await MongoRepository.pipe(result.value, clazz, repositoryOptions);
            });
    }

    private getReplaceObject(model: M) {
        const {_id, ...uModel} = model;
        return {
            ...uModel, lastUpdatedAt: new Date(), version: (model["version"] || 0) + 1
        };
    }

    private validateReplaceModel(model: M, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void> {
        return validate(plainToClass(clazz, model), repositoryOptions.validatorOptions).then((errors: ReadonlyArray<ValidationError>) => {
            if (errors.length) {
                throw new RepositoryValidationError(errors);
            }
            return;
        });
    }

}
