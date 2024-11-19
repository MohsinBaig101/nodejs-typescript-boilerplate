import {
  JsonController,
  Post,
  Res,
  UploadedFile,
  HttpCode,
  UseAfter,
} from 'routing-controllers';
import { Container } from 'typedi';
import * as express from 'express';
import {CustomError} from '../errors/CustomError';
import { fileUploadMiddleware } from '../customMiddleware/FileUploadMiddleware';
import { ErrorHandlerMiddleware } from '../customMiddleware/ErrorHandlerMiddleware';
import { ImagesService } from '../services/ImagesService';

@JsonController('/upload')
@UseAfter(ErrorHandlerMiddleware)
export class FileUploadController {
  private imageService: ImagesService;
  constructor() {
    this.imageService = Container.get(ImagesService);
  }

  /**
 * Controller method to handle POST requests for file upload.
 *
 * This method is mapped to the URL ("/file") of this controller.
 * It handles file uploads and processes the uploaded file.
 *
 * @param {Express.Multer.File} file - The uploaded file, handled by the file upload middleware.
 * @param {express.Response} response - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when the file processing is complete and sends an empty response.
 */
  @Post('/file')
  @HttpCode(200)
  async uploadFile(
    @UploadedFile('file', { options: fileUploadMiddleware, required: false }) file: Express.Multer.File,
    @Res() response: express.Response
  ) {
    if(!file){
      throw new CustomError('FILE_NOT_PROVIDED')
    }
    // Handle the uploaded file by parsing and processing the image CSV using the imageService.
    await this.imageService.parseImageCSVAndProcess(file);

    // Send an empty response indicating successful processing.
    return response.send();
  }

}
