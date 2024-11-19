import fs from "fs";
import * as path from "path";
import { Service } from "typedi";
import _ from "lodash";
import csv from "csv-parse";
import sharp from "sharp";
import bunyan from "bunyan";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../loaders/db/typeorm";
import { Image } from "../entities/Image.entity";
import {
    ensureDirectoryExistence,
    removeTempFile,
} from "../../lib/env/helpers";
import { env } from "../../../env";
import { ParsedImages } from "../types";
import { Logger } from "../../lib/logger";

@Service()
export class ImagesService {
    private dbInstance: DataSource;
    private log: bunyan;

    /**
     * Fetch DB Instance and Initialize the logger
     */
    constructor() {
        this.dbInstance = AppDataSource;
        this.log = new Logger(__filename).child({ serviceId: "IMAGE_SERVICE" });
    }

    /**
     * Retrieves images from the database within the specified depth range.
     * @param depthMin The minimum depth threshold for images to retrieve.
     * @param depthMax The maximum depth threshold for images to retrieve.
     * @returns A promise that resolves to an array of Image objects that fall within the specified depth range.
     */
    public async getImages(depthMin: number, depthMax: number): Promise<Image[]> {
        return await this.dbInstance
            .getRepository(Image)
            .createQueryBuilder("image")
            .where("image.depth >= :depthMin", { depthMin })
            .andWhere("image.depth <= :depthMax", { depthMax })
            .getMany();
    }

    /**
     * Parses an image CSV file and processes each row asynchronously.
     * @param file The file object containing the path to the CSV file.
     * @returns
     */

    public async parseImageCSVAndProcess(file: { path: string }): Promise<void> {
        // Initialize a logger specific to the image CSV parsing process
        const logger = this.log.child({
            type: "PARSE_IMAGE_CSV",
        });

        // Return a promise that wraps the asynchronous/streaming operation
        return await new Promise((resolve, reject) => {
            // Array to hold promises of parsed images
            let parsedImages: Promise<ParsedImages>[] = [];

            // Ensure that the directory exists where files will be uploaded
            ensureDirectoryExistence(
                path.join(process.cwd(), env.constants.fileUploadPath)
            );
            // Create a readable stream from the CSV file
            fs.createReadStream(file.path)
                // Pipe the stream through the CSV parser, treating the first row as headers
                .pipe(csv.parse({ columns: true }))
                // Handle each data row asynchronously
                .on("data", async (row) => {
                    /**
                     * Process each image row asynchronous, I'm waiting for sharpjs response.
                     * File Size is large and synchronously operation taking too much time
                     *  */
                    this.processImage(row, parsedImages, logger);
                })
                // When the CSV parsing ends
                .on("end", async () => {
                    // resolve the promises asynchronously and store data in DB.
                    this.handleImagePromises(file, resolve, parsedImages, logger);
                })
                // If an error occurs during parsing
                .on("error", async () => {
                    // Remove the temporary file and reject the promise with an error
                    removeTempFile(file.path, logger);
                    reject(new Error());
                });
        });
    }

    /**
     * Handles the images Promises, Below function running async to improve the API time.
     * @param file The file object containing the path to the CSV file.
     * @param resolve The function to call to resolve the promise
     * @param parsedImages An array of pending promises representing parsed images from the CSV rows.
     * @param logger The logger instance for logging informational messages and errors.
     */
    private async handleImagePromises(
        file: { path: string },
        resolve: Function,
        parsedImages: Promise<ParsedImages>[],
        logger: bunyan
    ) {
        // Resolve the promise that initiated the processing
        resolve();

        // Log an informational message with the current date indicating successful resolution of the promise
        logger.info({ date: new Date() }, "resolved");

        // promise will be resolved and data stored in the database
        this.resolveImgPromises(parsedImages, file, logger);
    }

    /**
     * Processes an image row from a CSV, extracting depth and pixel data to resize the image asynchronously.
     * @param row The CSV row containing image data, expected to have 'depth' and pixel values.
     * @param images Push the Promise in Images Array
     * @param logger The logger instance for logging informational messages and errors.
     */
    private processImage(
        row,
        images: Promise<ParsedImages>[],
        logger: bunyan
    ) {
        try {
            // Extract the depth from the CSV row and parse it as a number
            const depth: number = parseFloat(_.get(row, "depth"));

            // Extract pixel values from the CSV row (excluding 'depth') and convert them to integers
            const pixels: number[] = Object.keys(row)
                .filter((key) => key !== "depth")
                .map((key) => parseInt(row[key]));

            // Push a promise representing the resized image into the 'images' array
            images.push(this.resizeImage(pixels, depth, logger));
        } catch (err) {
            logger.error({ err }, 'FAILED_TO_PARSE_IMAGES');
        }
    }

    /**
     * Resolves promises representing resized images, saves them, and cleans up Excel temporary files.
     * @param images An array of promises representing resized images to be resolved.
     * @param file The file object containing the path to the original image file.
     * @param logger The logger instance for logging informational messages and errors.
     */
    private async resolveImgPromises(
        images: Promise<ParsedImages>[],
        file: { path: string },
        logger: bunyan
    ) {
        // Wait for all promises in the 'images' array to resolve, obtaining an array of resized images
        const resizedImages = await Promise.all(images);

        // Save the resized images to a persistent storage or perform further processing
        this.saveImages(resizedImages, logger);

        // Remove the temporary CSV or image file used during processing
        removeTempFile(file.path, logger);
    }

    /**
     * Resizes an image represented by pixel data and depth asynchronously.
     * @param pixels An array of numbers representing pixel values of the image.
     * @param depth The depth value associated with the image.
     * @param logger The logger instance for logging informational messages and errors.
     * @returns A promise that resolves to an object containing the resized image depth and pixel buffer.
     */
    private async resizeImage(
        pixels: number[],
        depth: number,
        logger: bunyan
    ): Promise<{ depth: number; pixels: Buffer }> {
        // Retrieve constants for original and resized image widths from environment settings
        const originalWidth = env.constants.imgOriginalWidth;
        const newWidth = env.constants.imgResizeWidth;

        // Calculate the height of the image based on the original image width and the length of the pixels array
        const height = pixels.length / originalWidth;

        // Convert the pixel array to a Buffer object
        const buffer = Buffer.from(pixels);

        // Use sharp library to resize the image buffer asynchronously
        const resizedBuffer = await sharp(buffer, {
            // Provide raw image metadata to sharp for proper processing
            raw: {
                width: originalWidth,
                height,
                channels: 1, // Assuming grayscale image with 1 channel
            },
        })
            // Resize the image to the specified new width
            .resize(newWidth)
            // Convert the image to PNG format
            .toFormat("png")
            // Convert the processed image back to a Buffer object
            .toBuffer();

        // Return an object containing the resized image depth and the resized image pixel buffer
        return { depth, pixels: resizedBuffer };
    }

    /**
     * Saves resized images to the database asynchronously.
     * @param resizedImages An array of objects containing resized image data (depth and pixels buffer).
     * @param logger The logger instance for logging informational messages and errors.
     */
    private async saveImages(
        resizedImages: {
            depth: number;
            pixels: Buffer;
        }[],
        logger: bunyan
    ) {
        try {
            // Save the resized images to the database using the repository associated with the Image entity
            await this.dbInstance.getRepository(Image).save(resizedImages);
        } catch (err) {
            // If an error occurs during database save operation, log the error
            logger.error({ err }, "FAILED_STORE_DOCUMENTS");
        }
    }
}
