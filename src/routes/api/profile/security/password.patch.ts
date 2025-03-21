import type { ProfileSecurityChangePasswordFormData } from '@kiki-core-stack/pack/types/data/profile';

export default defaultHonoFactory.createHandlers(
    apiZValidator(
        'json',
        z.object({
            conformPassword: z.string().trim().length(128),
            newPassword: z.string().trim().length(128),
            oldPassword: z.string().trim().length(128),
        }) satisfies ZodValidatorType<ProfileSecurityChangePasswordFormData>,
    ),
    async (ctx) => {
        const data = ctx.req.valid('json');
        if (data.newPassword !== data.conformPassword) throwApiError(400, '確認密碼不符！');
        await requireEmailOtpTwoFactorAuthentication(ctx, ctx.admin!, 'adminChangePassword');
        await requireTotpTwoFactorAuthentication(ctx, ctx.admin!);
        if (!ctx.admin!.verifyPassword(data.oldPassword)) throwApiError(400, '舊密碼不正確！');
        if (data.newPassword === data.oldPassword) throwApiError(400, '新密碼不能與舊密碼相同！');
        await ctx.admin!.updateOne({ password: data.newPassword });
        await cleanupAdminCachesAndSession(ctx, ctx.admin!);
        return ctx.createApiSuccessResponse();
    },
);
