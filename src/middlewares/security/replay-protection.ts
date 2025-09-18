import { createReplayProtectionMiddleware } from '@kiki-core-stack/pack/hono-backend/middlewares/replay-protection';

import { honoApp } from '@/core/app';

honoApp.use(
    '/api/*',
    createReplayProtectionMiddleware((ctx) => {
        return (
            !!ctx.routeHandler?.isHandler
            && !ctx.routeHandler.disableReplayProtection
            && !ctx.routeHandler.noLoginRequired
        );
    }),
);
