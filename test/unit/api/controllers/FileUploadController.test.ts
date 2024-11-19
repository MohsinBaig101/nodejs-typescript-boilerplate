import 'reflect-metadata';
import { FileUploadController } from '../../../../src/api/controllers/FileUploadController';
import { ImagesService } from '../../../../src/api/services/ImagesService';
import { Container } from 'typedi';
import * as sinon from 'sinon';
import { mockRequest, mockResponse } from 'mock-req-res';

describe('FileUploadController', () => {
  let fileUploadController: FileUploadController;
  let imagesServiceMock: sinon.SinonStubbedInstance<ImagesService>;

  beforeEach(() => {
    imagesServiceMock = sinon.createStubInstance(ImagesService);
    Container.set(ImagesService, imagesServiceMock);
    fileUploadController = new FileUploadController();
  });

  afterEach(() => {
    sinon.restore();
    Container.reset();
  });

  it('should successfully upload and process a file', async () => {
    const mockFile: Partial<Express.Multer.File> = { originalname: 'test.csv' };
    const req = mockRequest({ file: mockFile });
    const res = mockResponse();
    
    imagesServiceMock.parseImageCSVAndProcess.resolves();

    await fileUploadController.uploadFile(req.file, res);

    sinon.assert.calledOnce(imagesServiceMock.parseImageCSVAndProcess);
  });

  it('should handle errors during file processing', async () => {
    const mockFile: Partial<Express.Multer.File> = { originalname: 'test.csv' };
    const req = mockRequest({ file: mockFile });
    const res = mockResponse();

    const error = new Error('File processing failed');
    imagesServiceMock.parseImageCSVAndProcess.rejects(error);

    try {
      await fileUploadController.uploadFile(req.file, res);
    } catch (err) {
      sinon.assert.calledOnce(imagesServiceMock.parseImageCSVAndProcess);
      sinon.assert.calledWith(imagesServiceMock.parseImageCSVAndProcess, mockFile);
      sinon.assert.notCalled(res.send);
      expect(err).toEqual(error);
    }
  });
});
