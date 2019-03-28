import "reflect-metadata"
import {IsInt, IsISO8601, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';
import {Type} from "class-transformer";
import {Model} from "../../src/repository/IMongoRepository";
import Purchase from "./Purchase";


export default class User {
    public id: string;
    @IsString()
    @IsOptional()
    public name?: string;
    @IsISO8601()
    public createdAt: string;
    @IsISO8601()
    public lastUpdatedAt: string;
    @IsNumber()
    public version: number;
    @Type(() => Purchase)
    @ValidateNested({
        each: true,
    })
    public purchase: Purchase[];
}
