import ICommand from "./ICommand";
import {CreateModel, Model} from "../../IMongoRepository";
import {Collection, CollectionInsertOneOptions, OptionalId, ObjectId} from "mongodb";
import {validate, ValidationError} from "class-validator";
import {plainToClass} from "class-transformer";
import RepositoryValidationError from "../../../error/RepositoryValidationError";
import {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";


export default class AddCommand<M extends Model> implements ICommand<M, ObjectId> {

    constructor(private readonly model: CreateModel<M>, private readonly options?: CollectionInsertOneOptions) {

    }

    public execute(collection: Collection<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<ObjectId> {
        return Promise.resolve()
            .then(async () => {
                const model: any = {...this.model, ...AddCommand.createAdditionalProperty()};
                if (repositoryOptions.validateAdd) {
                    await this.validateCreateModel(model, clazz, repositoryOptions);
                }
                return collection.insertOne(model, this.options)
                    .then((result) => {
                        return result.insertedId;
                    });
            });
    }

    private validateCreateModel(model: OptionalId<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void> {
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
        }
    }

}
