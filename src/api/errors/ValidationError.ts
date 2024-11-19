import { getErrorMessage } from '../../lib/env/errorHelpers';
import { errorMessages } from '../contants/errorMessages';

export class ValidationError extends Error {
    public type: string;
    public code: unknown;
    public validationError: Error;
    private _field = '';
    private _message = '';

    public get message(): string {
        return getErrorMessage(this._field, this._message || errorMessages[this.type].error);
    }
    public set message(value: string) {
        this._message = value;
    }
    constructor(type: string, errors: Error) {
        super();
        this.type = type;
        this.validationError = errors;
        this.code = errorMessages[type].code;
    }

    public setErrorField(field: string): ValidationError {
        this._field = field;
        return this;
    }
    public get(): string {
        return this.type;
    }
}
