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
import { MongoRepository, ClassType, IMongoSpecification, Entity, FilterQuery, RepositoryValidationError } from "repository-generic";
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



class UserRepository extends MongoRepository<User> {
    constructor(db: Db) {
        super(db);
    }

    protected getClass(): ClassType<User> {
        return User;
    }
}

class NameUserSpecification implements IMongoSpecification<User>{

    private readonly name: string;

    constructor(name: string){
        this.name = name;
    }

    public specified(): FilterQuery<Entity<User>> {
        return {
            name: this.name,
        };
    }

}


const db = await this.getDb();

const userRepository = new UserRepository(db);

const id = await userRepository.add({name: "Test", purchase:[]})

userRepository.add({purchase: [new Purchase("")]})
    .catch((err: RepositoryValidationError) => {})

await userRepository.get(id);

await userRepository.findOne(new NameUserSpecification(name));

await userRepository.find(new NameUserSpecification(name));

await userRepository.update(id, { name: "Test3" });

await userRepository.findAndUpdate(new NameUserSpecification(name), { name: "Test2" });

await userRepository.delete(id);

```
