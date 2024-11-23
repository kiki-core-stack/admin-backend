import type { Subprocess } from 'bun';
import logger from 'consola';
import { env, once, pid } from 'node:process';

(() => {
    let isShuttingDown = false;
    const workersCount = Number(env.CLUSTER_WORKERS) || 4;
    const subprocesses: Subprocess[] = Array.from({ length: workersCount });
    const createAndSetSubprocess = (index: number) => {
        subprocesses[index] = Bun.spawn({
            cmd: [
                'bun',
                'run',
                './index.js',
                index.toString(),
                '--is-subprocess',
            ],
            onExit(_subprocess, exitCode, signalCode, error) {
                if (error || exitCode) {
                    logger.error(`[Worker ${index} (${pid})] Exited with exitCode ${exitCode} and error:`, error);
                    if (isShuttingDown) return logger.info(`[Worker ${index} (${pid})] Main process is shutting down. Do not restart.`);
                    logger.info(`[Worker ${index} (${pid})] Restarting in 1 second...`);
                    setTimeout(() => createAndSetSubprocess(index), 1000);
                } else if (exitCode !== null) logger.info(`[Worker ${index} (${pid})] Exited with code: ${exitCode}.`);
                else if (signalCode !== null) logger.info(`[Worker ${index} (${pid})] Exited with signal: ${signalCode}.`);
                else logger.info(`[Worker ${index} (${pid})] Exited.`);
            },
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    };

    for (let i = 0; i < workersCount; i++) createAndSetSubprocess(i);
    const shutdown = async (exitCode?: NodeJS.Signals | number) => {
        if (isShuttingDown) return;
        isShuttingDown = true;
        logger.info('[Main worker] Shutting down all subprocesses...');
        await Promise.all(
            subprocesses.map(async (subprocess, index) => {
                logger.info(`[Worker ${index} (${subprocess.pid})] Killing...`);
                subprocess.kill(exitCode);
                await subprocess.exited;
                logger.success(`[Worker ${index} (${subprocess.pid})] Exited.`);
            }),
        );

        logger.info('[Main worker] All subprocesses terminated.');
    };

    once('SIGINT', shutdown);
    once('SIGTERM', shutdown);
    once('exit', shutdown);
})();
