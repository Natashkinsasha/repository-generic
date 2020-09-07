import {Expose, Transform, Type} from "class-transformer";
import {Object} from "../../src/util";
import UserEntity from "./UserEntity";
import Purchase from "./Purchase";
import {IsDate, IsNumber, IsString, ValidateNested} from "class-validator";
import { ObjectId } from "mongodb";


export default class User{
    @Expose()
    public readonly _id: ObjectId;
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
