import "reflect-metadata"
import {IsBoolean, IsDate, IsInt, IsISO8601, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';
import {Type} from "class-transformer";
import {Model} from "../../src/repository/IMongoRepository";
import Purchase from "./Purchase";


export default class User {
    @IsString()
    public id: string;
    @IsString()
    public name: string;
    @IsDate()
    @Type(() => Date)
    public createdAt: Date;
    @IsDate()
    @Type(() => Date)
    public lastUpdatedAt: Date;
    @IsNumber()
    public version: number;
    @Type(() => Purchase)
    @ValidateNested({
        each: true,
    })
    public purchase: Purchase[];
    @IsBoolean()
    @IsOptional()
    public isDeleted?: boolean;
}
