import {IsISO8601} from "class-validator";


export default class Purchase {
    @IsISO8601()
    public createdAt: string;

    constructor(createdAt: string) {
        this.createdAt = createdAt;
    }
}