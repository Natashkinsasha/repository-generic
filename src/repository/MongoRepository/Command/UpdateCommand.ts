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


    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions<M,C>): Promise<void | C> {
        return Promise.resolve()
            .then(async () => {
                if (repositoryOptions.validateUpdate) {
                    await this.validateUpdateModel(this.model, clazz)
                }
                const query: FilterQuery<Model> = {_id: this._id};
                const update: UpdateQuery<Model> = {
                    $set: {...this.model, lastUpdatedAt: new Date()},
                    $inc: {version: 1},
                };
                return collection
                    .findOneAndUpdate(
                        query,
                        update,
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

    private getUpdateObject(model: UpdateModel<M>, repositoryOptions: IRepositoryOptions<M,C>) {
        const {version, ...uModel} = {version: 0, ...model};
        return {
            $set: {
                ...uModel, ...Object.entries(repositoryOptions)
                    .reduce((additionalProperty, [key, value]) => {
                        if (key === "lastUpdatedAt" && value) {
                            return {...additionalProperty, lastUpdatedAt: new Date()};
                        }
                        return additionalProperty;
                    }, {})
            },
            $inc: {
                ...Object.entries(repositoryOptions)
                    .reduce((additionalProperty, [key, value]) => {
                        if (key === "version" && value) {
                            return {...additionalProperty, version: 1};
                        }
                        return additionalProperty;
                    }, {})
            },
        };
    }

}
