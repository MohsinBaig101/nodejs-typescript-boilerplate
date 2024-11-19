import fs from 'fs';
import * as path from 'path';
import bunyan from 'bunyan';
import {
    filePath,
    ensureDirectoryExistence,
    writeFileAsync,
    validationErrorMapper,
    removeTempFile,
    stateTotalsMapper
} from '../../../../src/lib/env/helpers';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Utility functions', () => {
    describe('filePath', () => {
        it('should return the correct file path', () => {
            const result = filePath('some/path');
            expect(result).toBe(path.join(process.cwd(), 'some/path'));
        });
    });

    describe('ensureDirectoryExistence', () => {
        it('should create directory if it does not exist', () => {
            mockFs.existsSync.mockReturnValue(false);
            const mockMkdirSync = mockFs.mkdirSync;
            ensureDirectoryExistence('some/dir');
            expect(mockMkdirSync).toHaveBeenCalledWith('some/dir', { recursive: true });
        });
    });

    describe('writeFileAsync', () => {
        it('should write file successfully', async () => {
            const mockWriteFile = mockFs.writeFile;
            mockWriteFile.mockImplementation((path, data, callback) => callback(null));

            await expect(writeFileAsync(Buffer.from('data'), 'some/path')).resolves.toBeNull();
            expect(mockWriteFile).toHaveBeenCalledWith('some/path', Buffer.from('data'), expect.any(Function));
        });

        it('should reject on write file error', async () => {
            const mockWriteFile = mockFs.writeFile;
            mockWriteFile.mockImplementation((path, data, callback) => callback(new Error('Failed to write')));

            await expect(writeFileAsync(Buffer.from('data'), 'some/path')).rejects.toThrow('Failed to write');
        });
    });

    describe('validationErrorMapper', () => {
        it('should map validation errors correctly', () => {
            const validationErrors = [
                {
                    property: 'name',
                    constraints: { isNotEmpty: 'name should not be empty' },
                    children: []
                },
                {
                    property: 'address',
                    children: [
                        {
                            property: 'street',
                            constraints: { isNotEmpty: 'street should not be empty' },
                            children: []
                        }
                    ]
                }
            ];

            const expectedOutput = [
                { type: 'Functional', code: '81000008', message: 'name should not be empty', path: 'name' },
                { type: 'Functional', code: '81000008', message: 'street should not be empty', path: 'address.street' }
            ];

            const result = validationErrorMapper(validationErrors);
            expect(result).toEqual(expectedOutput);
        });
    });

    describe('removeTempFile', () => {
        let logger: bunyan;

        beforeEach(() => {
            logger = bunyan.createLogger({ name: 'testLogger' });
            jest.spyOn(logger, 'error');
            jest.spyOn(logger, 'info');
        });

        it('should log an error if file removal fails', () => {
            const mockUnlink = mockFs.unlink;
            mockUnlink.mockImplementation((path, callback) => callback(new Error('Failed to remove')));

            removeTempFile('some/path', logger);
            expect(mockUnlink).toHaveBeenCalledWith('some/path', expect.any(Function));
            expect(logger.error).toHaveBeenCalledWith('FAILED_TO_REMOVE_TEMP_FILE', expect.any(Error));
        });

        it('should log info if file is removed successfully', () => {
            const mockUnlink = mockFs.unlink;
            mockUnlink.mockImplementation((path, callback) => callback(null));

            removeTempFile('some/path', logger);
            expect(mockUnlink).toHaveBeenCalledWith('some/path', expect.any(Function));
            expect(logger.info).toHaveBeenCalledWith('TEMP_FILE_REMOVED', 'some/path');
        });
    });

    describe('stateTotalsMapper', () => {
        it('should map state totals correctly', () => {
            const stateTotals = [
                { state: 'CA', totalnetgeneration: '12345.6789' },
                { state: 'TX', totalnetgeneration: '98765.4321' }
            ];

            const expectedOutput = {
                CA: 12345.68,
                TX: 98765.43
            };

            const result = stateTotalsMapper(stateTotals);
            expect(result).toEqual(expectedOutput);
        });
    });
});
