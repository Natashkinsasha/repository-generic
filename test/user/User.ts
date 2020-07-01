import "reflect-metadata"
import {
    IsBoolean,
    IsDate,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';
import {Expose, Type} from "class-transformer";
import Purchase from "./Purchase";
import { ObjectId } from "mongodb";
import {Model} from "../../src/repository/IMongoRepository";


export default class User implements Model{
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
    public version: number;
    @Type(() => Purchase)
    @ValidateNested({
        each: true,
    })
    @Expose()
    public purchase: Purchase[];
    @IsBoolean()
    @IsOptional()
    @Expose()
    public isDeleted?: boolean;
}
