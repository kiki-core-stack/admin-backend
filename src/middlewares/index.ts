import { useHonoLogger } from '@kikiutils/node/hono';

import { honoApp } from '@/app';
import configs from '@/configs';
import session from '@/core/middlewares/session';
import { cookieSessionTokenHandler } from '@/core/middlewares/session/handlers/token';
import admin from './admin';
import api from './api';

useHonoLogger(honoApp);
honoApp.use('/api/*', session(configs.sessionCipherKey, cookieSessionTokenHandler));
honoApp.use('/api/*', admin);
honoApp.use('/api/*', api);
