import "reflect-metadata"
import {IsInt, IsOptional, IsString, ValidateNested} from 'class-validator';
import {Type} from "class-transformer";
import {Model} from "../../src/repository/MongoRepository";
import Purchase from "./Purchase";


export default class User implements Model {
    public id: string;
    @IsString()
    @IsOptional()
    public name?: string;
    public createdAt: string;
    public lastUpdateAt: string;
    public version: number;
    @Type(() => Purchase)
    @ValidateNested({
        each: true,
    })
    public purchase: Purchase[];
}
