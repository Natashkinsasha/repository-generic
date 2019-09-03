import {IsDate, IsISO8601} from "class-validator";
import {Type} from "class-transformer";


export default class Purchase {
    @IsDate()
    @Type(() => Date)
    public createdAt: Date;

    constructor(createdAt: Date) {
        this.createdAt = createdAt;
    }
}