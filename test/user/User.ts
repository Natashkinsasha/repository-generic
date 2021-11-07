import {Expose, Type} from "class-transformer";
import Purchase from "./Purchase";
import {IsDate, IsNumber, IsString, ValidateNested} from "class-validator";
import { ObjectId } from "mongodb";
import { ExposeId } from '../../src/util';


export default class User{
    @ExposeId()
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
