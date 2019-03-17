import { IsInt, IsOptional, IsString } from 'class-validator';
import {Model} from "../../src/repository/MongoRepository";


export default class User implements Model {
    public id: string;
    @IsString()
    @IsOptional()
    public name?: string;
    @IsString()
    @IsOptional()
    public instantFacebookId?: string;
    @IsString()
    @IsOptional()
    public imageUrl?: string;
    @IsString()
    @IsOptional()
    public locale?: string;

    @IsOptional()
    @IsString({
        each: true,
    })
    public instantFacebookFriends?: ReadonlyArray<string>;
    @IsString()
    @IsOptional()
    public countryCode?: string;
    @IsString({
        each: true,
    })
    public roles: ReadonlyArray<string>;
    public createdAt: string;
    public lastUpdateAt: string;
    public version: number;
}
