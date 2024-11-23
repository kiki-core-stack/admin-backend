import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z as zod } from '@kikiutils/kiki-core-stack-pack/constants/zod';
import { setupHonoAppErrorHandling } from '@kikiutils/kiki-core-stack-pack/hono-backend/setups/error-handling';
import '@kikiutils/kiki-core-stack-pack/hono-backend/setups/mongoose-model-statics';
import { env } from 'node:process';

import { honoApp } from '@/core/app';
import '@/configs';

// Extend Zod with OpenAPI
extendZodWithOpenApi(zod);

// Import global constants and utilities
await import('@/core/globals');
await import('@/globals');

// Setup error handling
setupHonoAppErrorHandling(honoApp);

// Load middlewares
await import('@/middlewares');

// Scan files and register routes
// eslint-disable-next-line node/prefer-global/process
await import(`@/core/routes-loader/${process.env.NODE_ENV}`);

// Start server
Bun.serve({
	fetch: honoApp.fetch,
	hostname: env.SERVER_HOST || '127.0.0.1',
	port: Number(env.SERVER_PORT) || 8000,
	reusePort: true,
});
