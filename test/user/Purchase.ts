import "reflect-metadata"
import {IsDate} from "class-validator";
import {Expose, Type} from "class-transformer";


export default class Purchase {
    @IsDate()
    @Type(() => Date)
    @Expose()
    public createdAt: Date;
}
