import ICommand from "./ICommand";
import {Collection, UpdateManyOptions} from "mongodb";
import {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import {Entity, UpdateModel} from "../../IMongoRepository";
import IMongoSpecification from "../../../specification/IMongoSpecification";
import {validate, ValidationError} from "class-validator";
import {plainToClass} from "class-transformer";
import RepositoryValidationError from "../../../error/RepositoryValidationError";


export default class FindAndUpdateCommand<M>implements ICommand<M, void>{

    constructor(private specification: IMongoSpecification<M>, private model: UpdateModel<M>, private options?: UpdateManyOptions){

    }

    public async execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void> {
        const query = this.specification && this.specification.specified() || {};
        if (repositoryOptions.validateUpdate) {
            await this.validateUpdateModel({...this.model, lastUpdatedAt: new Date()}, clazz, repositoryOptions)
        }
        if (repositoryOptions.softDelete) {
            const or = query['$or'] || [];
            return collection
                .updateMany(
                    {...query, $or: [{isDeleted: false}, {isDeleted: {$exists: false}}, ...or]},
                    {
                        $set: {...this.model, lastUpdatedAt: new Date()},
                        $inc: {version: 1},
                    },
                    this.options,
                )
                .then(() => {
                    return;
                });
        }
        return collection
            .updateMany(
                query,
                {
                    $set: {...this.model, lastUpdatedAt: new Date()},
                    $inc: {version: 1},
                },
                this.options,
            )
            .then(() => {
                return;
            });
    }

    private validateUpdateModel(model: UpdateModel<M>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void> {
        return validate(plainToClass(clazz, model), {...repositoryOptions.validatorOptions, skipMissingProperties: true}).then(
            (errors: ReadonlyArray<ValidationError>) => {
                if (errors.length) {
                    throw new RepositoryValidationError(errors);
                }
                return;
            }
        );
    }

}