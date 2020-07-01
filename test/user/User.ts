import {Expose, Transform, Type} from "class-transformer";
import {Object} from "../../src/util";
import UserEntity from "./UserEntity";
import Purchase from "./Purchase";
import {IsDate, IsNumber, IsString, ValidateNested} from "class-validator";


export default class User implements Object<UserEntity>{
    @Expose()
    @IsString()
    @Transform((value, object)=> object.id || object._id.toHexString())
    public readonly id: string;
    @IsString()
    @Expose()
    public name: string;
    @IsDate()
    @Type(() => Date)
    @Expose()
    public createdAt: Date;
    @IsDate()
    @Type(() => Date)
    @Expose()
    public lastUpdatedAt: Date;
    @IsNumber()
    public version: number;
    @Type(() => Purchase)
    @ValidateNested({
        each: true,
    })
    @Expose()
    public purchase: Purchase[];
}
