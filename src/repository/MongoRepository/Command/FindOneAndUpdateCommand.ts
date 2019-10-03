import ICommand from "./ICommand";
import {Collection, FindAndModifyWriteOpResultObject, FindOneAndUpdateOption} from "mongodb";
import {Entity, UpdateModel} from "../../IMongoRepository";
import MongoRepository, {ClassType} from "../MongoRepository";
import IRepositoryOptions from "../../IRepositoryOptions";
import IMongoSpecification from "../../../specification/IMongoSpecification";
import {validate, ValidationError} from "class-validator";
import {plainToClass} from "class-transformer";
import RepositoryValidationError from "../../../error/RepositoryValidationError";


export default class FindOneAndUpdateCommand<M> implements ICommand<M, M | void>{

    constructor(private specification: IMongoSpecification<M>, private model: UpdateModel<M>, private options?: FindOneAndUpdateOption){}

    public execute(collection: Collection<Entity<M>>, clazz: ClassType<M>, repositoryOptions: IRepositoryOptions): Promise<void | M> {
        return Promise.resolve()
            .then(async ()=>{
                if (repositoryOptions.validateUpdate) {
                    await this.validateUpdateModel({...this.model, lastUpdatedAt: new Date()}, clazz, repositoryOptions)
                }
                const query = this.specification && this.specification.specified();
                if (repositoryOptions.softDelete) {
                    const or = query['$or'] || [];
                    return collection
                        .findOneAndUpdate(
                            {...query, $or: [{isDeleted: false}, {isDeleted: {$exists: false}}, ...or]},
                            {
                                $set: {...this.model, lastUpdatedAt: new Date()},
                                $inc: {version: 1},
                            },
                            {returnOriginal: false, ...this.options}
                        );
                }
                return collection
                    .findOneAndUpdate(
                        query,
                        {
                            $set: {...this.model, lastUpdatedAt: new Date()},
                            $inc: {version: 1},
                        },
                        {returnOriginal: false, ...this.options}
                    );
            })
            .then(async (result: FindAndModifyWriteOpResultObject<Entity<M>>) => {
                if (!result.value) {
                    return;
                }
                return await MongoRepository.pipe(result.value, clazz, repositoryOptions);
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