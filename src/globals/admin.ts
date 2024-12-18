import { redisController } from '@kiki-core-stack/pack/controllers/redis';
import type { AdminDocument } from '@kiki-core-stack/pack/models/admin';
import { setReadonlyConstantToGlobalThis } from '@kikiutils/node';
import type { Context } from 'hono';

declare global {
    const cleanupAdminCachesAndSession: (ctx: Context, admin: AdminDocument) => Promise<void>;
}

setReadonlyConstantToGlobalThis<typeof cleanupAdminCachesAndSession>('cleanupAdminCachesAndSession', async (ctx, admin) => {
    await redisController.twoFactorAuthentication.emailOTPCode.del(admin);
    await redisController.twoFactorAuthentication.tempTOTPSecret.del(admin);
    ctx.clearSession();
});
