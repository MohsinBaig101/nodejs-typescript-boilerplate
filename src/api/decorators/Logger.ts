import { Container } from 'typedi';

import { Logger as BunyanLogger } from '../../lib/logger';

export function Logger(scope: string): ParameterDecorator {
    return (object: any, propertyKey, index) => {
        const logger = new BunyanLogger(scope);
        const childLog = logger.child({ type: 'BACKEND_LOG' });
        const propertyName = propertyKey ? propertyKey.toString() : '';
        Container.registerHandler({ object, propertyName, index, value: () => childLog });
    };
}
export { LoggerInterface } from '../../lib/logger';
