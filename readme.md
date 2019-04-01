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

### Defining a Model

```typescript
import "reflect-metadata"
import { IsOptional, IsString, IsISO8601, IsInt, IsOptional, IsString, ValidateNested, IsBoolean, IsNumber } from 'class-validator';
import { Type } from "class-transformer";

class Purchase {
    @IsISO8601()
    public createdAt: string;

    constructor(createdAt: string) {
        this.createdAt = createdAt;
    }
}

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
    @IsBoolean()
    @IsOptional()
    public isDeleted?: boolean;
}
```

### Create MongoRepository

```typescript
import { Db, MongoClient } from 'mongodb';
import { MongoRepository, ClassType, IRepositoryOptions } from "repository-generic";
import User from "./User"

class UserRepository extends MongoRepository<User> {
    constructor(db: Db, clinet: MongoClient, options: Partial<IRepositoryOptions>) {
        super(db, clinet, options);
    }

    protected getClass(): ClassType<User> {
        return User;
    }
}

```

### Create CacheReidsMongoRepository

```typescript
import { Db, MongoClient } from 'mongodb';
import { RedisClient } from "redis";
import { MongoRepository, ClassType, RedisCacheManager, CacheRedisMongoRepository, IRepositoryOptions } from "repository-generic";
import User from "./User"

class UserCacheManager extends RedisCacheManager<User> {
    protected getClass(): ClassType<User> {
        return User;
    }

    protected getCollectionName(): string {
        return 'user';
    }
}

class UserRepository extends CacheRedisMongoRepository<User> {
    constructor(db: Db, clinet: MongoClient, redisClient: RedisClient, options: Partial<IRepositoryOptions>) {
        super(db, clinet, new UserCacheManager(redisClient), options);
    }

    protected getClass(): ClassType<User> {
        return User;
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
        return userRepository.add({name: "Test", purchase:[]});
    }
    
    public findById(): Promise<User>{
        return userRepository.get(id);
    }
    
}
```


```
