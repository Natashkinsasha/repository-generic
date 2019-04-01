import ICommand from "./ICommand";
import {Collection, FindAndModifyWriteOpResultObject, FindOneAndUpdateOption, ObjectId} from "mongodb";
import {Entity} from "../../IMongoRepository";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import {validate, ValidationError} from "class-validator";
import {plainToClass} from "class-transformer";
import RepositoryValidationError from "../../../error/RepositoryValidationError";


export default class ReplaceCommand<M extends { id: string }> implements ICommand<M, M | void> {


    constructor(private model: M, private options?: FindOneAndUpdateOption) {
    }


    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void | M> {
        return Promise
            .resolve()
            .then(async () => {
                if (repositoryOptions.validate) {
                    await this.validateReplaceModel(this.model, clazz)
                }
                if (repositoryOptions.softDelete) {
                    return collection
                        .findOneAndUpdate(
                            {
                                _id: new ObjectId(this.model.id),
                                $or: [{isDeleted: false}, {isDeleted: {$exists: false}}]
                            },
                            this.getReplaceObject(this.model, repositoryOptions),
                            {returnOriginal: false, ...this.options}
                        )
                        .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                            if (!result.value) {
                                return;
                            }
                            return MongoRepository.pipe(result.value, clazz);
                        });
                }
                return collection
                    .findOneAndUpdate(
                        {_id: new ObjectId(this.model.id)},
                        this.getReplaceObject(this.model, repositoryOptions),
                        {returnOriginal: false, ...this.options}
                    )
                    .then((result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                        if (!result.value) {
                            return;
                        }
                        return MongoRepository.pipe(result.value, clazz);
                    });
            })
    }

    private getReplaceObject(model: M, repositoryOptions: IRepositoryOptions) {
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

    private validateReplaceModel(model: M, clazz: ClassType<M>): Promise<void> {
        return validate(plainToClass(clazz, model)).then((errors: ReadonlyArray<ValidationError>) => {
            if (errors.length) {
                throw new RepositoryValidationError(errors);
            }
            return;
        });
    }

}