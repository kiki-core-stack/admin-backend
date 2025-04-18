import { Buffer } from 'node:buffer';

import { checkAndGetEnvValue } from '@kikiutils/node/env';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

export type Configs = ReadonlyDeep<{
    openApi: Except<OpenAPIObject, 'components' | 'paths' | 'webhooks'>;
    sessionCipherKey: string;
}>;

export const configs: Configs = {
    openApi: {
        info: {
            title: 'API Document',
            version: '0.1.0',
        },
        openapi: '3.1.0',
    },
    sessionCipherKey: (() => {
        const sessionCipherKey = Buffer.from(checkAndGetEnvValue('SESSION_CIPHER_KEY'), 'ascii').toString('ascii');
        if (sessionCipherKey.length !== 32) {
            // eslint-disable-next-line style/max-len
            throw new Error(`Invalid SESSION_CIPHER_KEY length: expected 32 bytes (256 bits for AES-256) when parsed as ASCII, but got ${sessionCipherKey.length} bytes.`);
        }

        return sessionCipherKey;
    })(),
};
