import {ClassTransformOptions} from "class-transformer";
import {ValidatorOptions} from "class-validator";
import {Model} from "./IMongoRepository";


export default interface IRepositoryOptions<M extends Model, C>{
    validateAdd?: boolean;
    validateUpdate?: boolean;
    validateReplace?: boolean;
    validateGet?: boolean;
    classTransformOptions?: ClassTransformOptions;
    validatorOptions?: ValidatorOptions;
    customTransform: (entity: M) => C;

}
