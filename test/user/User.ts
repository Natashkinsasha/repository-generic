import { IsInt, IsOptional, IsString } from 'class-validator';
import {Model} from "../../src/repository/MongoRepository";


export default class User implements Model {
    public id: string;
    @IsString()
    @IsOptional()
    public name?: string;
    public createdAt: string;
    public lastUpdateAt: string;
    public version: number;
}
