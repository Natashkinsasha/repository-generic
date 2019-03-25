repository-generic
================

Repository base class for Node.JS. Currently only supports MongoDB.

## Installation

Npm
```javascript
npm install repository-generic
```

Yarn
```javascript
yarn add repository-generic
```

# Support

This library is quite fresh, and maybe has bugs. Write me an **email** to *natashkinsash@gmail.com* and I will fix the bug in a few working days.

# Quick start

This library can be use with JavaScript, but better use one with TypeScript.

```typescript
import "reflect-metadata"
import { Db } from 'mongodb';
import { RedisClient } from 'redis';
import { Model, MongoRepository, ClassType } from "repository-generic";
import { IsOptional, IsString, IsISO8601, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from "class-transformer";


class Purchase {
    @IsISO8601()
    public createdAt: string;
}

class User implements Model {
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


class UserRepository extends MongoRepository<User> {
    constructor(db: Db) {
        super(db);
    }

    protected getClass(): ClassType<User> {
        return User;
    }
}

```
