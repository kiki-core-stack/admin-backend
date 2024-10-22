import { checkAndGetEnvValue } from '@kikiutils/node/env';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { ReadonlyDeep } from 'type-fest';

export type Configs = ReadonlyDeep<{
	openAPI: Omit<OpenAPIObject, 'components' | 'paths' | 'webhooks'>;
	sessionCipherKey: string;
}>;

const sessionCipherKey = Buffer.from(checkAndGetEnvValue('SESSION_CIPHER_KEY'), 'ascii').toString('ascii');
if (sessionCipherKey.length !== 32) throw new Error(`Invalid SESSION_CIPHER_KEY length: expected 32 bytes (256 bits for AES-256) when parsed as ASCII, but got ${sessionCipherKey.length} bytes.`);
export const configs: Configs = {
	openAPI: {
		info: { title: 'API Document', version: '0.1.0' },
		openapi: '3.1.0'
	},
	sessionCipherKey
};

export default configs;
