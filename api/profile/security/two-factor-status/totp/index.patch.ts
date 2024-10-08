import redisController from '@kikiutils/kiki-core-stack-pack/controllers/redis';
import type { AdminDocument } from '@kikiutils/kiki-core-stack-pack/models';
import type { UpdateQuery } from 'mongoose';

export default defineEventHandler(async (event) => {
	const admin = event.context.admin!.$clone();
	if (!(admin.totpSecret = (await redisController.twoFactorAuthentication.tempTotpSecret.get(admin)) || admin.totpSecret)) createApiErrorAndThrow(500, '系統錯誤，請重整頁面後再試！');
	const isEnabled = admin.twoFactorAuthenticationStatus.totp;
	admin.twoFactorAuthenticationStatus.totp = true;
	await requireTwoFactorAuthentication(event, true, true, admin);
	const updateQuery: UpdateQuery<AdminDocument> = { 'twoFactorAuthenticationStatus.totp': !isEnabled };
	if (isEnabled) updateQuery.$unset = { totpSecret: true };
	else updateQuery.totpSecret = admin.totpSecret;
	await admin.updateOne(updateQuery);
	await redisController.twoFactorAuthentication.tempTotpSecret.del(admin);
	return createApiSuccessResponseData();
});
