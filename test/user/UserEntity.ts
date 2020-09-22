import "reflect-metadata"
import {
    IsDate,
    IsNumber,
    IsString,
    ValidateNested
} from 'class-validator';
import {Expose, Transform, Type} from "class-transformer";
import Purchase from "./Purchase";
import { ObjectId } from "mongodb";
import {Model} from "../../src/repository/IMongoRepository";


export default class UserEntity implements Model{
    @Expose()
    public _id: ObjectId;
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
    @Expose()
    public version: number;
    @Type(() => Purchase)
    @ValidateNested({
        each: true,
    })
    @Expose()
    public purchase: Purchase[];
}
