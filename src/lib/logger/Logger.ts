import * as path from 'path';
import bunyan from 'bunyan';
import { LogLevel } from './LogLevel';
import { ConsoleRawStram } from './ConsoleRawStream';
import { env } from '../../../env';

export class Logger {
    private logger: any;

    constructor(name: string = 'app') {
        this.logger = bunyan.createLogger({
            name: this._parsePath(name),
            streams: [
                {
                    stream: new ConsoleRawStram() as any,
                },
            ],
        });
    }

    public child(data: unknown): bunyan {
        return this.logger.child(data);
    }

    public trace(msg: string, additional?: unknown): void {
        this._log(msg, additional, 'trace');
    }
    public info(msg: string, additional?: unknown): void {
        this._log(msg, additional, 'info');
    }
    public debug(msg: string, additional?: unknown): void {
        this._log(msg, additional, 'debug');
    }
    
    public infoDebug(msg: string, additional?: unknown): void {
        if (env.log.debugMode) {
            this._log(msg, additional, 'info');
        }
    }

    public warnDebug(msg: string, additional?: unknown): void {
        if (env.log.debugMode) {
            this._log(msg, additional, 'warn');
        }
    }

    public error(err: Error, additional?: unknown): void {
        const merged = this._merge(err, additional);
        this._log(merged.msg || merged.message, merged, 'error');
    }

    public fatal(err: Error, additional?: unknown): void {
        const merged = this._merge(err, additional);
        this._log(merged.msg || merged.message, merged, 'fatal');
    }

    public setLogLevel(logLevel = 'INFO') {
        this.logger.level(logLevel);
    }
    public getLogLevel(): LogLevel {
        return this.logger.level() as LogLevel;
    }
    public _parsePath(filePath: string): string {
        if (filePath.indexOf(path.sep) >= 0) {
            filePath = filePath.replace(process.cwd(), '');
            filePath = filePath.replace(`${path.sep}src${path.sep}`, '');
            filePath = filePath.replace(`${path.sep}dist${path.sep}`, '');
            filePath = filePath.replace('.ts', '');
            filePath = filePath.replace('.js', '');
            filePath = filePath.replace(/[/\\]/g, '');
        }
        return filePath;
    }
    private _log(msg: string, additional?: unknown, level: string = 'info'): void {
        this.logger[level](additional, msg);
    }
    private _merge(error: Error | { message: string, additional?}, additional): { err?: { message: string }, msg?: string, message?: string } {
        let err: { message: string } = { message: '' };
        let mergedObj = {};
        let msg = '';

        if (error instanceof Error) {
            err = bunyan.stdSerializers.err(error);
            msg = err && err.message;
        } else if (typeof error === 'object' && !Array.isArray(error)) {
            err = error;
            msg = err && error.message;
        } else if (typeof error === 'string') {
            msg = error;
        }

        if (typeof additional === 'object' && !Array.isArray(additional)) {
            mergedObj = Object.assign({}, { err, msg }, additional);
        } else {
            mergedObj = { err, msg };
        }
        return mergedObj;
    }
}
