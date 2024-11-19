import {
    Get,
    HttpCode,
    UseAfter,
    Controller
} from 'routing-controllers';
import { ClassValidator } from '../decorators/Validator';
import { Container } from 'typedi';
import { ErrorHandlerMiddleware } from '../customMiddleware/ErrorHandlerMiddleware';
import { ImagesService } from '@services/ImagesService';
import { ImageQuery } from '../DTOS/ImagesQueryDTO';
import { Image } from "../entities/Image.entity";

@Controller('/images')
@UseAfter(ErrorHandlerMiddleware)
export class ImagesController {
    private imageService: ImagesService;
    constructor() {
        this.imageService = Container.get(ImagesService);
    }

    /**
   * Controller method to handle GET requests for fetching images.
   *
   * This method is mapped to the root URL ("/") of this controller.
   * It validates the query parameters using the ImageQuery class.
   * If the query parameters are valid, it fetches images based on the specified depth range.
   *
   * @returns {Promise<Image[]>} - A promise that resolves to an array of Image objects.
   */
    @Get('/')
    @HttpCode(200)
    async getImages(
        @ClassValidator(ImageQuery, 'query') query: ImageQuery,
    ): Promise<Image[]> {
        // Fetch images using the imageService with the provided depth range.
        return this.imageService.getImages(query.depthMin, query.depthMax);
    }

}
