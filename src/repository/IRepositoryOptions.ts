import {ClassTransformOptions} from "class-transformer";
import {ValidatorOptions} from "class-validator";


export default interface IRepositoryOptions{
    validateAdd: boolean;
    validateUpdate: boolean;
    validateReplace: boolean;
    validateGet: boolean;
    classTransformOptions: ClassTransformOptions;
    validatorOptions: ValidatorOptions;
}
