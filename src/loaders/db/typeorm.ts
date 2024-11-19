import { DataSource } from 'typeorm';
import { Image, Plant } from '../../api/entities'
import { Logger } from "../../lib/logger";


const log = new Logger(__filename).child({ serviceId: "MONGO_LOADER" })
export const AppDataSource: DataSource = new DataSource({
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [Image, Plant],
} as any);

export async function typeOrmLoader() {
    try {
        /**
         * Initialize the DB connection
         */
        await AppDataSource.initialize();
        /**
         * DB Initialized
         */
        log.info('DB_INITIALIZED');
    } catch (err) {
        log.error({ err }, 'FAILED_TO_CONNECT_TO_DB');
    }
}
