import { join } from 'node:path';

import { getMiddlewareFilePaths } from './libs/middleware';
import { getRouteDefinitions } from './libs/router';
import logger from './utils/logger';

async function generateMiddlewaresLoader() {
    const fileLines = [
        '// @ts-nocheck',
        'export default async function () {',
    ];

    const startTime = performance.now();
    logger.info('Starting to generate production middlewares...');
    const middlewareFilePaths = await getMiddlewareFilePaths();
    for (const filePath of middlewareFilePaths) fileLines.push(`    await import('${filePath}');`);
    fileLines.push('}');
    await Bun.write(join(import.meta.dirname, 'loaders/middlewares/production.ts'), `${fileLines.join('\n')}\n`);
    // eslint-disable-next-line style/max-len
    logger.success(`Generated production ${middlewareFilePaths.length} middlewares in ${(performance.now() - startTime).toFixed(2)}ms.`);
}

async function generateRoutesLoader() {
    const fileLines = [
        '// @ts-nocheck',
        `import { loadRouteModule } from '../../libs/router';`,
        'export default async function () {',
    ];

    const startTime = performance.now();
    logger.info('Starting to generate production routes...');
    const routeDefinitions = await getRouteDefinitions();
    // eslint-disable-next-line style/object-curly-newline
    for (const { filePath, ...routeDefinition } of routeDefinitions) {
        fileLines.push(`    loadRouteModule(await import('${filePath}'), ${JSON.stringify(routeDefinition)});`);
    }

    fileLines.push('}');
    await Bun.write(join(import.meta.dirname, 'loaders/routes/production.ts'), `${fileLines.join('\n')}\n`);
    // eslint-disable-next-line style/max-len
    logger.success(`Generated production ${routeDefinitions.length} routes in ${(performance.now() - startTime).toFixed(2)}ms.`);
}

(async () => await Promise.all([
    generateMiddlewaresLoader(),
    generateRoutesLoader(),
]))();
