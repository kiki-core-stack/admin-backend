import { createConsola } from 'consola';
import type { InputLogObject } from 'consola';
import { colorize } from 'consola/utils';
import { format } from 'date-fns';
import { pid } from 'node:process';

const consola = createConsola({ formatOptions: { date: false } });
const createLogDateTimePrefix = () => `[${format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS')}]`;
const logPrefix = Bun.argv.includes('--is-subprocess') ? colorize('cyan', `[Worker ${Bun.argv[2]} (${pid})]`) : colorize('green', '[Main worker]');
export const logger = {
    error: (message: InputLogObject | any, ...args: any[]) => consola.error(createLogDateTimePrefix(), logPrefix, message, ...args),
    info: (message: InputLogObject | any, ...args: any[]) => consola.info(createLogDateTimePrefix(), logPrefix, message, ...args),
    success: (message: InputLogObject | any, ...args: any[]) => consola.success(createLogDateTimePrefix(), logPrefix, message, ...args),
    warn: (message: InputLogObject | any, ...args: any[]) => consola.warn(createLogDateTimePrefix(), logPrefix, message, ...args),
};

export default logger;
