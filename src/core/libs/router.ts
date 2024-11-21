import { glob } from 'glob';
import { resolve, sep } from 'node:path';
import { env } from 'node:process';

const allowedHttpMethods = [
	'delete',
	'get',
	'head',
	'options',
	'patch',
	'post',
	'purge',
	'put',
] as const;

function filePathSegmentToRankValue(segment: string, isLast: boolean) {
	if (segment === '*' && isLast) return 1e12;
	if (segment === '*') return 1e10;
	if (segment.startsWith(':') && segment.includes('.')) return 11;
	if (segment.startsWith(':')) return 111;
	return 1;
}

function filePathToRank(path: string) {
	const segments = path.split('/');
	return +segments.map((segment, index) => filePathSegmentToRankValue(segment, index === segments.length - 1)).join('');
}

export async function scanDirectoryForRoutes(directoryPath: string, baseUrlPath: string) {
	directoryPath = resolve(directoryPath).replaceAll(sep, '/');
	const allFilePaths = await glob(`${directoryPath}/**/*.{mj,t}s`);
	const environment = env.NODE_ENV === 'production' ? 'prod' : 'dev';
	const filePattern = new RegExp(`^${directoryPath}(.*?)(\/index)?\\.(${allowedHttpMethods.join('|')})(\\.${environment})?\\.(mj|t)s$`);
	const matchedRoutes = [];
	for (const filePath of allFilePaths) {
		const matches = filePath.match(filePattern);
		if (!matches) continue;
		const normalizedRoutePath = `${baseUrlPath}${matches[1]!}`.replaceAll(/\/+/g, '/');
		matchedRoutes.push({
			filePath,
			method: matches[3]!,
			openAPIPath: normalizedRoutePath.replaceAll(/\[([^/]+)\]/g, '{$1}'),
			path: normalizedRoutePath.replaceAll(/\[([^/]+)\]/g, ':$1'),
		});
	}

	return matchedRoutes.sort((a, b) => filePathToRank(a.path) - filePathToRank(b.path));
}