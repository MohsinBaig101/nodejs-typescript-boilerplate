import * as sinon from 'sinon';
import { Container } from 'typedi';
import { ImagesController } from '../../../../src/api/controllers/ImagesController';
import { ImagesService } from '../../../../src/api/services/ImagesService';

describe('ImagesController', () => {
  let imagesController: ImagesController;
  let imagesService: ImagesService;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    imagesService = new ImagesService();
    Container.set(ImagesService, imagesService);
    imagesController = new ImagesController();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getImages', () => {
    it('should return an array of images', async () => {
      const imageQuery = {
        depthMin: 10,
        depthMax: 20
      };

      const mockImages = [
        { id: 1, pixels: [1, 2, 3], depth: 15 },
        { id: 2, pixels: [1, 2, 3], depth: 18 }
      ];

      sandbox.stub(imagesService, 'getImages').resolves(mockImages as any);

      const result = await imagesController.getImages(imageQuery);

      expect(result).toEqual(mockImages);
    });
  });
});
