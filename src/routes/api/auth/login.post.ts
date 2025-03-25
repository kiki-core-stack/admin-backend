import { AdminLogType } from '@kiki-core-stack/pack/constants/admin';
import { AdminModel } from '@kiki-core-stack/pack/models/admin';
import { AdminLogModel } from '@kiki-core-stack/pack/models/admin/log';
import type { AdminLoginFormData } from '@kiki-core-stack/pack/types/data/admin';

import { createOrUpdateAdminSessionAndSetAuthToken } from '@/libs/admin';

export const routeHandlerOptions = defineRouteHandlerOptions({ properties: { noLoginRequired: true } });

export default defaultHonoFactory.createHandlers(
    apiZValidator(
        'json',
        z.object({
            account: z.string().trim().min(1),
            password: z.string().trim().min(1),
            verCode: z.string().trim().min(1).toLowerCase(),
        }) satisfies ZodValidatorType<AdminLoginFormData>,
    ),
    async (ctx) => {
        const data = ctx.req.valid('json');
        if (data.verCode !== ctx.popSession('verCode')?.toLowerCase()) {
            throwApiError(400, '驗證碼不正確！', { isVerCodeIncorrect: true });
        }

        const admin = await AdminModel.findOne({
            account: data.account,
            enabled: true,
        });

        if (!admin?.enabled || !admin.verifyPassword(data.password)) throwApiError(404, '帳號不存在，未啟用或密碼不正確！');
        const ip = getXForwardedForHeaderFirstValue(ctx);
        await createOrUpdateAdminSessionAndSetAuthToken(ctx, admin.id, ip);
        AdminLogModel.create({
            admin,
            ip,
            type: AdminLogType.LoginSuccess,
        });

        return ctx.createApiSuccessResponse();
    },
);
