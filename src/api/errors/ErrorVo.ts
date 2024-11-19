export class ErrorVO {

    public type: string;
    public code: string;
    public message: string;
    constructor(type: string, code: string, message: string) {
        this.type = type;
        this.code = code;
        this.message = message;
    }
}
