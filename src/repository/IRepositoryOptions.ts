import {ClassTransformOptions} from "class-transformer";
import {ValidatorOptions} from "class-validator";


export default interface IRepositoryOptions{
    version: boolean;
    createdAt: boolean;
    lastUpdatedAt: boolean;
    softDelete: boolean;
    validate: boolean;
    classTransformOptions: ClassTransformOptions;
    validatorOptions: ValidatorOptions;
}