import bunyan from 'bunyan';
import { Logger } from '../../../../src/lib/logger/Logger';
import { ConsoleRawStram } from '../../../../src/lib/logger/ConsoleRawStream';
import { env } from '../../../../env';

// Mock bunyan
jest.mock('bunyan');
jest.mock('../../../../env', () => ({
    env: {
        log: {
            debugMode: false,
        },
    },
}));

describe('Logger', () => {
    let logger;
    let mockLogger;

    beforeEach(() => {
        mockLogger = {
            child: jest.fn(),
            trace: jest.fn(),
            info: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            fatal: jest.fn(),
            level: jest.fn(),
        };
        jest.spyOn(bunyan, 'createLogger').mockReturnValue(mockLogger);
        logger = new Logger('testLogger');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a logger with correct name', () => {
        expect(bunyan.createLogger).toHaveBeenCalledWith({
            name: 'testLogger',
            streams: [{ stream: expect.any(ConsoleRawStram) }],
        });
    });

    it('should call child method of bunyan logger', () => {
        const childData = { key: 'value' };
        logger.child(childData);
        expect(mockLogger.child).toHaveBeenCalledWith(childData);
    });

    it('should log trace messages', () => {
        const msg = 'trace message';
        logger.trace(msg);
        expect(mockLogger.trace).toHaveBeenCalledWith(undefined, msg);
    });

    it('should log info messages', () => {
        const msg = 'info message';
        logger.info(msg);
        expect(mockLogger.info).toHaveBeenCalledWith(undefined, msg);
    });

    it('should log debug messages', () => {
        const msg = 'debug message';
        logger.debug(msg);
        expect(mockLogger.debug).toHaveBeenCalledWith(undefined, msg);
    });

    it('should log info messages in debug mode', () => {
        env.log.debugMode = true;
        const msg = 'infoDebug message';
        logger.infoDebug(msg);
        expect(mockLogger.info).toHaveBeenCalledWith(undefined, msg);
    });

    it('should not log info messages when not in debug mode', () => {
        env.log.debugMode = false;
        const msg = 'infoDebug message';
        logger.infoDebug(msg);
        expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should log warn messages in debug mode', () => {
        env.log.debugMode = true;
        const msg = 'warnDebug message';
        logger.warnDebug(msg);
        expect(mockLogger.warn).toHaveBeenCalledWith(undefined, msg);
    });

    it('should not log warn messages when not in debug mode', () => {
        env.log.debugMode = false;
        const msg = 'warnDebug message';
        logger.warnDebug(msg);
        expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should set log level', () => {
        const logLevel = 'DEBUG';
        logger.setLogLevel(logLevel);
        expect(mockLogger.level).toHaveBeenCalledWith(logLevel);
    });

    it('should get log level', () => {
        mockLogger.level.mockReturnValue('INFO');
        const logLevel = logger.getLogLevel();
        expect(logLevel).toBe('INFO');
    });
});
