import logger from '@/core/libs/logger';

import { getRouteDefinitions, loadRouteModule } from '../../libs/router';

export default async function () {
    const startTime = performance.now();
    const routeDefinitions = await getRouteDefinitions();
    let totalRouteCount = 0;
    for (const routeDefinition of routeDefinitions) {
        try {
            loadRouteModule(await import(routeDefinition.filePath), routeDefinition);
            totalRouteCount++;
        } catch (error) {
            logger.error(`Failed to load route file ${routeDefinition.filePath}. Error:`, (error as Error).message);
        }
    }

    logger.info(`Successfully loaded ${totalRouteCount} routes in ${(performance.now() - startTime).toFixed(2)}ms.`);
}