import { glob } from 'glob';
import { resolve, sep } from 'path';

const allowedHttpMethods = [
	'delete',
	'get',
	'head',
	'options',
	'patch',
	'post',
	'purge',
	'put'
] as const;

export const scanDirectoryForRoutes = async (directoryPath: string, baseUrlPath: string) => {
	directoryPath = resolve(directoryPath).replaceAll(sep, '/');
	const allFilePaths = await glob(`${directoryPath}/**/*.{mj,t}s`);
	const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
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
			path: normalizedRoutePath.replaceAll(/\[([^/]+)\]/g, ':$1')
		});
	}

	return matchedRoutes.sort((a, b) => filePathToRank(a.path) - filePathToRank(b.path));
};

function filePathSegmentToRankValue(segment: string, isLast: boolean) {
	if (segment === '*' && isLast) return 1e12;
	if (segment === '*') return 1e10;
	if (segment.startsWith(':') && segment.includes('.')) return 11;
	if (segment.startsWith(':')) return 111;
	return 1;
}

function filePathToRank(path: string) {
	let rank = '';
	const segments = path.split('/');
	for (let i = 0; i < segments.length; i++) {
		const isLast = i === segments.length - 1;
		rank += filePathSegmentToRankValue(segments[i]!, isLast);
	}

	return +rank;
}
