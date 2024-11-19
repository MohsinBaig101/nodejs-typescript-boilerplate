const logLevel = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
};

export class ConsoleRawStram {
    public write(rec: string): void {
        if (rec) {
            const parsedRed = JSON.parse(rec);
            const level: string = logLevel[parsedRed.level];
            const obj = { ...parsedRed, level: level.toUpperCase };
            rec = JSON.stringify(obj);
            console[level](rec);
        }
    }
}
