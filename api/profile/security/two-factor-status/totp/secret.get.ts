import redisController from '@kikiutils/kiki-core-stack-pack/controllers/redis';
import { generateTotpSecretData } from '@kikiutils/kiki-core-stack-pack/utils/two-factor-authentication';

export default defineEventHandler(async (event) => {
	if (event.context.admin!.twoFactorAuthenticationStatus.totp) return createApiSuccessResponseData();
	const totpSecretData = generateTotpSecretData('後台管理系統', event.context.admin!.account);
	await redisController.twoFactorAuthentication.tempTotpSecret.set(event.context.admin!, totpSecretData.secret);
	return createApiSuccessResponseData(totpSecretData);
});
