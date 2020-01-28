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

### Defining model

```typescript
import "reflect-metadata"
import { IsOptional, IsString, IsDate, IsInt, IsOptional, IsString, ValidateNested, IsBoolean, IsNumber } from 'class-validator';
import { Type, Expose } from "class-transformer";

class Purchase {
    @Expose()
    @IsDate()
    @Type(() => Date)
    public createdAt: Date;
}

export default class User {
    @Expose()
    public id: string;
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

### Create MongoRepository

```typescript
import { Db, MongoClient } from 'mongodb';
import { MongoRepository, ClassType, IRepositoryOptions } from "repository-generic";
import User from "./User"

class UserRepository extends MongoRepository<User> {
    constructor(db: Db, client: MongoClient) {
        super(db, client, {
            version: true,
            createdAt: true,
            lastUpdatedAt: true,
            validateUpdate: true,
            validateReplace: true,
            validateAdd: true,
            validateGet: true,
            classTransformOptions: { excludeExtraneousValues: true },
        });
    }

    protected getClass(): ClassType<User> {
        return User;
    }
}

```

### Create NameUserSpecification

```typescript

import {FilterQuery, IMongoSpecification, Entity} from "repository-generic"
import User from "./User";

export default class NameUserSpecification implements IMongoSpecification<User>{

    private readonly name: string;

    constructor(name: string){
        this.name = name;
    }

    specified(): FilterQuery<Entity<User>> {
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
