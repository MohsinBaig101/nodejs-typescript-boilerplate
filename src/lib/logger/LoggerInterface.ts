import bunyan from 'bunyan';

export interface LoggerInterface<T> {
    trace(msg: string, additional?: T): void;
    debug(msg: string, additional?: T): void;
    info(msg: string, additional?: T): void;
    warn(msg: string, additional?: T): void;
    error(msg: string, additional?: T): void;
    child(msg: unknown): bunyan;
}
