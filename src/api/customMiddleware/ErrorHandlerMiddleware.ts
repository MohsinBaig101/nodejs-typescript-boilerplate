import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { errorMessages } from '../contants/errorMessages';
import * as express from 'express';
import bunyan from 'bunyan';
import * as HTTP_STATUS from 'http-status-codes';
import { formErrorResponseObject } from '../../lib/env';
import { CustomError } from '../errors/CustomError';
import { Logger } from '../../lib/logger';
import { ValidationError } from '../errors/ValidationError';
import { validationErrorMapper } from '../../lib/env/helpers';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    private log: bunyan;
    constructor() {
        this.log = (new Logger(__filename)).child({ serviceId: 'ERROR_MIDDLEWARE' });
    }

    public async error(error: Error | CustomError | ValidationError, request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
        let errorDetails: unknown;
        let errorStatus: number;
        const logger = this.log.child({
            type: 'RESPONSE',
        });
        logger.error(error, 'API_ERROR');
        if (error instanceof CustomError) {
            const { type, code, message }: { type: string, code: string, message: string } = error;
            logger.info('ERROR_INSTANCE_OF_CUSTOM_ERROR');
            errorDetails = formErrorResponseObject(type, code, message);
            errorStatus = HTTP_STATUS.BAD_REQUEST;
        } else if (error instanceof ValidationError) {
            errorDetails = validationErrorMapper(error?.validationError);
            errorStatus = HTTP_STATUS.BAD_REQUEST;
        } else {
            errorDetails = formErrorResponseObject(
                errorMessages.TECHNICAL_FAILURE.type,
                errorMessages.TECHNICAL_FAILURE.code,
                errorMessages.TECHNICAL_FAILURE.error
            );
            logger.info('ERROR_TECHNICAL_FAILURE');
            errorStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        }
        response.status(errorStatus).json(errorDetails);
        error = undefined;
    }
}
