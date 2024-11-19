import { Service } from "typedi";
import _ from "lodash";
import bunyan from "bunyan";
import * as Excel from "exceljs";
import { DataSource } from "typeorm";
import { Plant } from "../entities/Plant.entity";
import { AppDataSource } from "../../loaders/db/typeorm";
import { removeTempFile, stateTotalsMapper } from "../../lib/env/helpers";
import { env } from "../../../env";
import { Logger } from "../../lib/logger";
import { ignoreNodes } from "../contants/excel";
import { getPlantsMapper } from "../../lib/dataMapper/internal";
import { IPlant } from "../interfaces/internal/IPlant";

@Service()
export class PlantsService {
  /**
   * Represents the database instance used by the ImageService for data operations.
   */
  private dbInstance: DataSource;

  /**
   * Represents the logger instance used by the ImageService for logging purposes.
   */
  private log: bunyan;

  /**
   * Constructs an instance of the ImageService class.
   * Initializes the logger and database instance.
   */
  constructor() {
    // Initialize a logger specific to the ImageService class, identifying it with a service ID
    this.log = new Logger(__filename).child({ serviceId: "IMAGE_SERVICE" });

    // Initialize the database instance using the AppDataSource
    this.dbInstance = AppDataSource;
  }

  /**
   * Parses an Excel file, extracts plant data, saves it in the database, and performs cleanup.
   * @param file The Excel file object to parse.
   * @returns A promise that resolves when processing is complete.
   */
  public async handleExcelFile(file: Express.Multer.File): Promise<void> {
    // Initialize a logger specific to the parseFile function with a type identifier
    const logger = this.log.child({
      type: "PARSE_EXCEL",
    });

    // Log the start time of the file parsing process
    logger.info({ startTime: new Date() }, "PROCESS_START_TIME");

    try {
      // Initialize an Excel workbook and read the provided Excel file
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(file?.path, {
        ignoreNodes,
      });

      // Log the timestamp after successfully reading the Excel file
      logger.info({ startTime: new Date() }, "TIME_AFTER_READING_THE_FILE");

      // Get the specific worksheet by name (PLNT22) from the workbook
      const worksheet: { eachRow: Function } = workbook.getWorksheet(
        env.constants.plantSheetName
      );

      // Array to store parsed plant data
      const plants: IPlant[] = [];

      // Iterate over each row in the worksheet
      worksheet.eachRow((row, rowNumber: number) => {
        // Skip header rows (headers are in the first two rows)
        if (rowNumber > 2) {
          // Extract data from the current row and add it to the plants array
          this.getRowData(row, plants);
        }
      });

      // Save parsed plant data in the database
      await this.savePlantDataInDB(plants);

      // Remove the temporary Excel file after processing
      removeTempFile(file.path, logger);

      // Log the end time of the file parsing process
      logger.info({ endTime: new Date() }, "PROCESS_END_TIME");
    } catch (error) {
      // Handle any errors that occur during file parsing, logging them with the logger
      logger.error({ error }, "ERROR_DURING_FILE_PARSE");
      throw error; // Rethrow the error to propagate it upwards
    }

    // Return nothing explicitly (undefined) to signify completion of the function
    return;
  }
  /**
   * Extracts plant data from a row in an Excel worksheet and adds it to the plants array.
   * @param row The row object from the Excel worksheet.
   * @param plants An array to store the extracted plant data.
   */
  private getRowData(row, plants: IPlant[]) {
    const rowData: IPlant = {
      plantName: _.get(row.getCell(env.constants.plantNameColumnIndex), 'value'),
      state: _.get(row.getCell(env.constants.plantStateColumnIndex), 'value'),
      annualNetGeneration: Math.abs(_.get(row.getCell(env.constants.plantNetGenColumnIndex), 'value', 0)),
      latitude: _.get(row.getCell(env.constants.plantLatitudeColumnIndex), 'value'),
      longitude: _.get(row.getCell(env.constants.plantLongitudeColumnIndex), 'value'),
    };
    // Push the extracted plant data object into the plants array
    plants.push(rowData);
  }
  /**
   * Saves an array of plant data objects to the database.
   * @param plants An array of plant data objects (IPlant[]) to be saved.
   * @returns A promise that resolves when the data is successfully saved in the database.
   */
  private savePlantDataInDB(plants: IPlant[]): Promise<unknown> {
    // Use the database manager to save the array of plant data to the 'Plant' entity/table
    return this.dbInstance.manager.save(Plant, plants);
  }

  /**
   * Retrieves plants data based on the specified filter.
   * @param filterBy The filter criteria: "plants", "stateTotals", "state", or "plantPercentage".
   * @param topPlants Optional. The number of top plants to retrieve.
   * @param state Optional. The state to filter plants by.
   * @returns A promise that resolves with the requested data based on the filter criteria.
   */
  public async getPlants(
    filterBy: string,
    topPlants?: number,
    state?: string
  ) {
    switch (filterBy) {
      case "plants":
        return await this.getPlantsList(topPlants);
      case "stateTotals":
        return await this.calculateStateTotals();
      case "state":
        return await this.filterPlantsByState(state);
      case "plantPercentage":
        return await this.calculatePlantPercentages();
      default:
        return await this.getPlantsList(20); // Default to fetching 20 plants if filterBy is unrecognized
    }
  }

  /**
   * Calculates total net generation grouped by state for plants.
   * @returns A promise that resolves with an object mapping states to their total net generation.
   */
  private async calculateStateTotals(): Promise<{ [state: string]: number }> {
    // Query database to calculate total net generation grouped by state
    const stateTotals = await this.dbInstance.manager
      .getRepository(Plant)
      .createQueryBuilder("plants")
      .select(
        "plants.state, SUM(plants.annualNetGeneration) AS totalnetgeneration"
      )
      .groupBy("plants.state")
      .getRawMany();

    // Map the raw database result to a formatted state totals object
    return stateTotalsMapper(stateTotals);
  }

  /**
   * Calculates the percentage of net generation for each plant relative to its state's total net generation.
   * @returns A promise that resolves with an array of objects containing plant names and their percentages.
   */
  private async calculatePlantPercentages(): Promise<
    { plantName: string; percentage: number }[]
  > {
    // Execute a SQL query to calculate plant percentages based on net generation and state totals
    const plantPercentages = await this.dbInstance.manager.getRepository(Plant)
      .query(`
          SELECT
              p.id,
              p.plant_name AS "plantName",
              p.state,
              p.latitude,
              p.longitude,
              p.net_generation AS "annualNetGeneration",
              st.total_net_generation AS "stateTotalAnnualNetGeneration",
              ROUND((p.net_generation::numeric / st.total_net_generation) * 100, 2) AS "percentage"
          FROM
              plants p
          JOIN (
              SELECT
                  state,
                  SUM(net_generation) AS total_net_generation
              FROM
                  plants
              GROUP BY
                  state
          ) st ON p.state = st.state
          ORDER BY
              p.net_generation DESC;
      `);

    // Return the calculated plant percentages as an array of objects
    return plantPercentages;
  }

  /**
   * Retrieves a list of plants sorted by annual net generation in descending order, limited to a specified number.
   * @param nthPlants Optional. The number of top plants to retrieve. Defaults to 20.
   * @returns A promise that resolves with an array of Plant objects representing the top plants.
   */
  private async getPlantsList(nthPlants: number = 20): Promise<Plant[]> {
    // Query database to retrieve top plants based on annual net generation
    const queryResult = await this.dbInstance.manager
      .getRepository(Plant)
      .createQueryBuilder("plants")
      .orderBy("plants.annualNetGeneration", "DESC") // Order by annual net generation in descending order
      .limit(nthPlants) // Limit the number of results to 'nthPlants'
      .getMany(); // Execute query and get the results as an array

    // Map the query result using a mapper function to transform data if needed
    return getPlantsMapper(queryResult);
  }

  /**
   * Retrieves plants filtered by the specified state.
   * @param state Optional. The state to filter plants by. Defaults to "AK" if not provided.
   * @returns A promise that resolves with an array of Plant objects filtered by the specified state.
   */
  private async filterPlantsByState(state: string = "AK"): Promise<Plant[]> {
    // Query database to find plants filtered by the specified state
    const queryResult = await this.dbInstance.manager
      .getRepository(Plant)
      .find({
        where: {
          state, // Filter plants by 'state'
        },
      });

    // Map the query result using a mapper function to transform data if needed
    return getPlantsMapper(queryResult);
  }
}
