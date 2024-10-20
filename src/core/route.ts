import logger from '@kikiutils/node/consola';
import type { Server } from '@kikiutils/hyper-express';
import { glob } from 'glob';
import { relative, resolve, sep } from 'path';

import { zodOpenAPIRegistry } from './constants/zod-openapi';
import type { RouteHandlerOptions } from './types/hyper-express';

const allowedHttpMethods = [
	'connect',
	'delete',
	'get',
	'head',
	'options',
	'patch',
	'post',
	'put',
	'trace'
] as const;

export const registerRoutesFromFiles = async (server: Server, scanDirPath: string, baseUrlPath: string) => {
	scanDirPath = resolve(scanDirPath).replaceAll(sep, '/');
	const routeFilePathPattern = new RegExp(`^${scanDirPath}(.*?)(/index)?\\.(${allowedHttpMethods.join('|')})\\.(mj|t)s$`);
	let totalRouteCount = 0;
	const startTime = performance.now();
	const routeFilePaths = await glob(`${scanDirPath}/**/*.{${allowedHttpMethods.join(',')}}.{mj,t}s`);
	for (const routeFilePath of routeFilePaths) {
		try {
			const routeModule = await import(routeFilePath);
			if (!routeModule.default) continue;
			const matches = routeFilePath.match(routeFilePathPattern);
			if (!matches) continue;
			const method = matches[3]!;
			const routePath = `${baseUrlPath}${matches[1]!}`.replaceAll(/\/+/g, '/');
			const latestHandler = routeModule.default.at(-1);
			const routeHandlerOptions: RouteHandlerOptions | undefined = routeModule.handlerOptions || routeModule.options || routeModule.routeHandlerOptions;
			if (routeHandlerOptions) {
				if (routeHandlerOptions.environment) {
					const environments = [routeHandlerOptions.environment].flat() as string[];
					if (environments.length && process.env.NODE_ENV && !environments.includes(process.env.NODE_ENV)) continue;
				}

				Object.assign(latestHandler, routeHandlerOptions.properties);
				delete routeHandlerOptions.properties;
				routeModule.default.unshift(routeHandlerOptions);
			}

			if (routeModule.zodOpenAPIConfig) {
				zodOpenAPIRegistry.registerPath({
					...routeModule.zodOpenAPIConfig,
					method,
					path: routePath.replaceAll(/\[([^/]+)\]/g, '{$1}')
				});
			}

			Object.defineProperty(latestHandler, 'isHandler', {
				configurable: false,
				value: true,
				writable: false
			});

			server[method as (typeof allowedHttpMethods)[number]](routePath.replaceAll(/\[([^/]+)\]/g, ':$1'), ...routeModule.default);
			totalRouteCount++;
		} catch (error) {
			logger.error(`Failed to load route file: ${routeFilePath}`, (error as Error).message);
		}
	}

	logger.info(`Successfully registered ${totalRouteCount} routes from '${relative(process.cwd(), scanDirPath)}' in ${(performance.now() - startTime).toFixed(2)}ms`);
};
