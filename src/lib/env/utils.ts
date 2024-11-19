import { ErrorResponse } from '../../api/errors/ErrorResponse';
import { ErrorVO } from '../../api/errors/ErrorVo';
import _ from 'lodash';
import { join } from 'path';

export function getOsEnv(key: string): string {
    return process.env[key] as string;
}

export function getOsEnvNumber(key: string, defaultValue: number = 10): number {
    return parseInt(process.env[key] as string, defaultValue);
}

export function getOsEnvArray(key: string, delimiter: string = ','): string[] {
    return process.env[key] && process.env[key].split(delimiter) || [];
}

export function getOsEnvBoolean(key: string, defaultValue?: string): boolean {
    return toBool((process.env[key] || defaultValue) as string);
}
export function toBool(value: string): boolean {
    return (/true/i).test(value);
}

export function formErrorResponseObject(type: string, code: string, message: string) {
    const err = new ErrorVO(type, code, message);
    const errorsObject = new ErrorResponse([err]);
    return errorsObject;
}

export function getPath(path: string): string {
    return (process.env.NODE_ENV === 'production')
        ? join(process.cwd(), path.replace('src/', 'dist/').slice(0, -3) + '.js')
        : join(process.cwd(), path);
}

export function getPaths(paths: string[]): string[] {
    return paths.map(p => getPath(p));
}

export function getOsPath(key: string): string {
    return getPath(getOsEnv(key));
}
// export function getOsEnvArray(key: string, delimiter: string = ','): string[] {
//     return process.env[key] && process.env[key].split(delimiter) || [];
// }
export function getOsPaths(key: string): string[] {
    return getPaths(getOsEnvArray(key));
}

export const getEnvFile = <T>(depEnv: string, APP_ENV: T): string => {
    if (process.env.NODE_ENV === "test") {
        return ".env.test";
    }

    if (depEnv) {
        const envFile = APP_ENV[depEnv.toUpperCase()];
        if (envFile) {
            return `aiq-v1-${depEnv.toLowerCase()}.env`;
        }
    }

    return ".env";
};