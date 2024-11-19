import { ConsoleRawStram } from '../../../../src/lib/logger/ConsoleRawStream';

describe('ConsoleRawStram', () => {
    let originalConsole: any;
    let consoleRawStram: ConsoleRawStram;

    beforeAll(() => {
        originalConsole = { ...console };
    });

    beforeEach(() => {
        consoleRawStram = new ConsoleRawStram();
        console.trace = jest.fn();
        console.debug = jest.fn();
        console.info = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();
    });

    afterAll(() => {
        console = originalConsole;
    });

    it('should write log with correct level and message', () => {
        const rec = JSON.stringify({ level: 30, message: 'This is an info message' });
        consoleRawStram.write(rec);

        expect(console.info).toHaveBeenCalledWith(JSON.stringify({
            message: 'This is an info message'
        }));
    });

    it('should handle trace level correctly', () => {
        const rec = JSON.stringify({ level: 10, message: 'This is a trace message' });
        consoleRawStram.write(rec);

        expect(console.trace).toHaveBeenCalledWith(JSON.stringify({
            message: 'This is a trace message'
        }));
    });

    it('should handle debug level correctly', () => {
        const rec = JSON.stringify({ level: 20, message: 'This is a debug message' });
        consoleRawStram.write(rec);

        expect(console.debug).toHaveBeenCalledWith(JSON.stringify({
            message: 'This is a debug message'
        }));
    });

    it('should handle warn level correctly', () => {
        const rec = JSON.stringify({ level: 40, message: 'This is a warn message' });
        consoleRawStram.write(rec);

        expect(console.warn).toHaveBeenCalledWith(JSON.stringify({
            message: 'This is a warn message'
        }));
    });

    it('should handle error level correctly', () => {
        const rec = JSON.stringify({ level: 50, message: 'This is an error message' });
        consoleRawStram.write(rec);

        expect(console.error).toHaveBeenCalledWith(JSON.stringify({
            message: 'This is an error message'
        }));
    });



    it('should do nothing if rec is empty', () => {
        consoleRawStram.write('');
        expect(console.trace).not.toHaveBeenCalled();
        expect(console.debug).not.toHaveBeenCalled();
        expect(console.info).not.toHaveBeenCalled();
        expect(console.warn).not.toHaveBeenCalled();
        expect(console.error).not.toHaveBeenCalled();
    });
});
