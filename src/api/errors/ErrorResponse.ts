import { ErrorVO } from './ErrorVo';

export class ErrorResponse {
    public errors: ErrorVO[];

    constructor(errors: ErrorVO[]) {
        this.errors = errors;
    }
}
