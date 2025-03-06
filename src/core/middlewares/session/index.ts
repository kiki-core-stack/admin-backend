import { AesCipher } from 'node-ciphers';
import type { BinaryLike } from 'node:crypto';
import onChange from 'on-change';

import {
    sessionChangedSymbol,
    sessionClearedSymbol,
} from './constants';
import type {
    PartialContextSessionData,
    SessionTokenHandler,
} from './types';
import {
    clearSession,
    popSession,
} from './utils';

type StoredData = [number, PartialContextSessionData];

export default (cipherKey: BinaryLike, tokenHandler: SessionTokenHandler) => {
    const cipher = new AesCipher.Gcm(
        cipherKey,
        {
            authTag: 'base64',
            decryptInput: 'base64',
            encryptOutput: 'base64',
            iv: 'base64',
        },
    );

    return defaultHonoFactory.createMiddleware(async (ctx, next) => {
        let sessionData = {};
        const sessionToken = tokenHandler.get(ctx);
        if (sessionToken) {
            const storedData = cipher.decryptToJson<StoredData>(sessionToken.substring(40), sessionToken.substring(24, 40), sessionToken.substring(0, 24));
            if (storedData && storedData[0] + 86400000 > Date.now()) sessionData = storedData[1];
            else tokenHandler.delete(ctx);
        }

        ctx.clearSession = clearSession.bind(ctx);
        ctx.popSession = popSession.bind(ctx);
        ctx.session = onChange(
            sessionData,
            () => {
                onChange.unsubscribe(ctx.session);
                ctx[sessionChangedSymbol] = true;
            },
            { ignoreSymbols: true },
        );

        await next();
        if (ctx[sessionClearedSymbol]) return tokenHandler.delete(ctx);
        if (!ctx[sessionChangedSymbol]) return;
        const encryptResult = cipher.encryptJson([
            Date.now(),
            ctx.session,
        ]);

        if (encryptResult) tokenHandler.set(ctx, `${encryptResult.authTag}${encryptResult.iv}${encryptResult.data}`);
    });
};
