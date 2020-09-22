import { ValidationError } from 'class-validator';

export default class RepositoryValidationError extends Error {
    public readonly errors: ReadonlyArray<ValidationError>;

    constructor(errors: ReadonlyArray<ValidationError>) {
        super(`Repository insertion errors: ${errors}`);
        this.errors = errors;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
