import { JsonController, Res, Get, Post, Req, UploadedFile, HttpCode, UseAfter } from 'routing-controllers';
import { Container } from 'typedi';
import * as express from 'express';
import { fileUploadMiddleware } from '../customMiddleware/FileUploadMiddleware';
import { ErrorHandlerMiddleware } from '../customMiddleware/ErrorHandlerMiddleware';
import { PlantsService } from '../services/PlantsService';
import { ClassValidator } from '../decorators/Validator';
import { CustomError } from '../errors/CustomError';
import { PlantsQuery } from '../DTOS/PlantsQueryDTO';

@JsonController('/plants')
@UseAfter(ErrorHandlerMiddleware)
export class PlantsController {
  private plantsService: PlantsService;
  constructor(
  ) {
    this.plantsService = Container.get(PlantsService);
  }

  /**
 * Controller method to handle POST requests for file upload.
 *
 * This method is mapped to the URL ("/upload/file") of this controller.
 * It handles file uploads and processes the uploaded file.
 *
 * @param {Express.Multer.File} file - The uploaded file, handled by the file upload middleware.
 * @param {express.Response} response - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when the file processing is complete and sends an empty response.
 */
  @Post('/upload/file')
  @HttpCode(200)
  async uploadFile(
    @UploadedFile('file', { options: fileUploadMiddleware }) file: Express.Multer.File,
    @Res() response: express.Response
  ) {
    if (!file) {
      throw new CustomError('FILE_NOT_PROVIDED')
    }
    // Handle the uploaded file using the plantsService.
    await this.plantsService.handleExcelFile(file);

    // Send an empty response indicating successful processing.
    return response.send();
  }

  /**
 * Controller method to handle GET requests for fetching plants.
 *
 * This method is mapped to the root URL ("/") of this controller.
 * It validates the query parameters using the PlantsQuery class.
 * If the query parameters are valid, it fetches plants based on the specified filters.
 *
 * @param {PlantsQuery} query - The validated query parameters for filtering plants.
 * @param {express.Request} req - The Express request object.
 * @returns {Promise<any>} - A promise that resolves to the list of filtered plants.
 */
  @Get('/')
  @HttpCode(200)
  async getPlants(
    @ClassValidator(PlantsQuery, 'query') query: PlantsQuery,
    @Req() req: express.Request
  ): Promise<any> {
    // Destructure the query parameters for filtering plants.
    const { filterBy, topPlants, state } = query;

    // Fetch plants using the plantsService with the provided query parameters.
    return await this.plantsService.getPlants(filterBy, topPlants, state);
  }
}
