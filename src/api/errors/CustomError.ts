import {getErrorMessage} from '../../lib/env/errorHelpers';
import { errorMessages } from '../contants/errorMessages';

export class CustomError extends Error {
    public type: string;
    public code: string;
    private _field = '';
    private _message = '';

    public get message(): string {
        return getErrorMessage(this._field, this._message || errorMessages[this.type].error);
    }
    public set message(value: string) {
        this._message = value;
    }
    constructor(type: string) {
        super();
        this.type = type;
        this.code = errorMessages[type].code;
    }

    public setErrorField(field: string): CustomError {
        this._field = field;
        return this;
    }
    public get(): string {
    return this.type;
    }
}
