import { redisController } from '@kiki-core-stack/pack/controllers/redis';
import { generateTOTPSecretData } from '@kiki-core-stack/pack/utils/two-factor-authentication';

export default defaultHonoFactory.createHandlers(async (ctx) => {
    if (ctx.admin!.twoFactorAuthenticationStatus.totp) return ctx.createAPISuccessResponse();
    const totpSecretData = generateTOTPSecretData('後台管理系統', ctx.admin!.account);
    await redisController.twoFactorAuthentication.tempTOTPSecret.set(ctx.admin!, totpSecretData.secret);
    return ctx.createAPISuccessResponse(totpSecretData);
});
