import ICommand from "./ICommand";
import {Collection, FindAndModifyWriteOpResultObject, FindOneAndUpdateOption, ObjectId} from "mongodb";
import MongoRepository, {ClassType} from "../MongoRepository";
import {Entity, UpdateModel} from "../../IMongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import {validate, ValidationError} from "class-validator";
import {plainToClass} from "class-transformer";
import RepositoryValidationError from "../../../error/RepositoryValidationError";


export default class UpdateCommand<M> implements ICommand<M, M | void> {


    constructor(private id: string, private  model: UpdateModel<M>, private options?: FindOneAndUpdateOption) {
    }


    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void | M> {
        return Promise.resolve()
            .then(async () => {
                if (repositoryOptions.validate) {
                    await this.validateUpdateModel(this.model, clazz)
                }
                if (repositoryOptions.softDelete) {
                    return collection
                        .findOneAndUpdate(
                            {_id: new ObjectId(this.id), $or: [{isDeleted: false}, {isDeleted: {$exists: false}}]},
                            this.getUpdateObject(this.model, repositoryOptions),
                            {returnOriginal: false, ...this.options}
                        )
                        .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                            if (!result.value) {
                                return;
                            }
                            return MongoRepository.pipe(result.value, clazz, repositoryOptions);
                        });
                }
                return collection
                    .findOneAndUpdate(
                        {_id: new ObjectId(this.id)},
                        this.getUpdateObject(this.model, repositoryOptions),
                        {returnOriginal: false, ...this.options}
                    )
                    .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                        if (!result.value) {
                            return;
                        }
                        return MongoRepository.pipe(result.value, clazz, repositoryOptions);
                    });

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

    private getUpdateObject(model: UpdateModel<M>, repositoryOptions: IRepositoryOptions) {
        const {version, ...uModel} = {version: 0, ...model};
        return {
            $set: {
                ...uModel, ...Object.entries(repositoryOptions)
                    .reduce((additionalProperty, [key, value]) => {
                        if (key === "lastUpdatedAt" && value) {
                            return {...additionalProperty, lastUpdatedAt: new Date().toISOString()};
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