import ICommand from "./ICommand";
import {CreateModel, Entity} from "../../IMongoRepository";
import {Collection, CollectionInsertOneOptions, InsertOneWriteOpResult} from "mongodb";
import {validate, ValidationError} from "class-validator";
import {plainToClass} from "class-transformer";
import RepositoryValidationError from "../../../error/RepositoryValidationError";
import {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";


export default class AddCommand<M> implements ICommand<M, string> {

    constructor(private model: CreateModel<M>, private  options?: CollectionInsertOneOptions) {

    }

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<string> {
        return Promise.resolve()
            .then(async () => {
                if (repositoryOptions.softDelete) {
                    const model = {
                        ...this.model, ...this.createAdditionalProperty(repositoryOptions),
                        isDeleted: false
                    };
                    if (repositoryOptions.validate) {
                        await this.validateCreateModel({
                            ...this.model, ...this.createAdditionalProperty(repositoryOptions),
                            isDeleted: false
                        }, clazz)
                    }
                    return collection.insertOne(model, this.options)
                        .then((result: InsertOneWriteOpResult) => {
                            return result.insertedId.toHexString();
                        });
                }
                const model = {...this.model, ...this.createAdditionalProperty(repositoryOptions)};
                if (repositoryOptions.validate) {
                    await this.validateCreateModel({...this.model, ...this.createAdditionalProperty(repositoryOptions)}, clazz)
                }
                return collection.insertOne(model, this.options)
                    .then((result: InsertOneWriteOpResult) => {
                        return result.insertedId.toHexString();
                    });
            });
    }

    private validateCreateModel(model: CreateModel<M>, clazz: ClassType<M>): Promise<void> {
        return validate(plainToClass(clazz, model)).then((errors: ReadonlyArray<ValidationError>) => {
            if (errors.length) {
                throw new RepositoryValidationError(errors);
            }
            return;
        });
    }

    private createAdditionalProperty(options: IRepositoryOptions): { version?: number, createdAt?: string, lastUpdatedAt?: string, softDelete?: boolean } {
        return Object.entries(options)
            .reduce((additionalProperty, [key, value]) => {
                if (key === "version" && value) {
                    return {...additionalProperty, version: 0};
                }
                if (key === "createdAt" && value) {
                    return {...additionalProperty, createdAt: new Date().toISOString()};
                }
                if (key === "lastUpdatedAt" && value) {
                    return {...additionalProperty, lastUpdatedAt: new Date().toISOString()};
                }
                if (key === "softDelete" && value) {
                    return {...additionalProperty, isDeleted: false};
                }
                return additionalProperty;
            }, {});
    }

}