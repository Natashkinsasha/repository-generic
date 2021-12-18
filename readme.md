# repository-generic

## Description

Repository base class for Node.JS. Currently only supports MongoDB.

## Installation

Npm
```bash
npm install repository-generic
```

Yarn
```bash
yarn add repository-generic
```

## Support

This library is quite fresh, and maybe has bugs. Write me an **email** to *natashkinsash@gmail.com* and I will fix the bug in a few working days.


## Overview

This library can be use with JavaScript, but better use one with TypeScript.

### Defining models

```typescript
import "reflect-metadata"
import { ObjectId } from "mongodb";
import { IsOptional, IsString, IsDate, IsInt, IsOptional, IsString, ValidateNested, IsBoolean, IsNumber } from 'class-validator';
import { Type, Expose } from "class-transformer";
import { Model } from "repository-generic";

class Purchase {
    @Expose()
    @IsDate()
    @Type(() => Date)
    public createdAt: Date;
}

export default class UserEntity extends Model {
    @Expose()
    public _id: ObjectId;
    @IsString()
    @IsOptional()
    @Expose()
    public name?: string;
    @IsDate()
    @Expose()
    @Type(() => Date)
    public createdAt: Date;
    @IsDate()
    @Type(() => Date)
    @Expose()
    public lastUpdatedAt: Date;
    @IsNumber()
    @Expose()
    public version: number;
    @Type(() => Purchase)
    @ValidateNested({
        each: true
    })
    @Expose()
    public purchase: Purchase[];
    @IsBoolean()
    @IsOptional()
    @Expose()
    public isDeleted?: boolean;
}
```

```typescript
import {Expose, Transform, Type} from "class-transformer";
import {Object} from "repository-generic";
import UserEntity from "./UserEntity";
import Purchase from "./Purchase";
import {IsDate, IsNumber, IsString, ValidateNested} from "class-validator";

export default class User implements Object<UserEntity>{
    @Expose()
    @IsString()
    @Transform((value, object)=> object.id || object._id.toHexString())
    public readonly id: string;
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
```

### Create MongoRepository

```typescript
import { Db, MongoClient } from 'mongodb';
import {plainToClass} from "class-transformer";
import { MongoRepository, ClassType } from "repository-generic";
import User from "./User"
import UserEntity from "./UserEntity"

class UserRepository extends MongoRepository<UserEntity, User>(UserEntity) {
    constructor(client: MongoClient) {
        super(client, {
            version: true,
            createdAt: true,
            lastUpdatedAt: true,
            validateUpdate: true,
            validateReplace: true,
            validateAdd: true,
            validateGet: true,
            classTransformOptions: { excludeExtraneousValues: true },
            customTransform: (entity: UserEntity) => plainToClass<User, UserEntity>(User, entity)
        });
    }

    protected getDbName(): string {
        throw 'test';
    }
}

```

### Create NameUserSpecification

```typescript

import {FilterQuery, IMongoSpecification, Entity} from "repository-generic"
import UserEntity from "./UserEntity";

export default class NameUserSpecification implements IMongoSpecification<UserEntity>{

    private readonly name: string;

    constructor(name: string){
        this.name = name;
    }

    public specified(): FilterQuery<UserEntity> {
        return {
            name: this.name,
        };
    }

}

```


### Create UserService

```typescript

import User from "./User";
import UserRepository from "./UserRepository";

class UserService {
    
    constructor(private userRepository: UserRepository){}
    
    public create(): Promise<string>{
        return this.userRepository.add({name: "Test", purchase:[]});
    }
    
    public findById(): Promise<User>{
        return this.userRepository.get(id);
    }
    
    public findByName(name: string): Promise<User | void>{
        return this.userRepository.findOne(new NameUserSpecification(name));
    }   

    
}
```


```
