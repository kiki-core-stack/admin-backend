import { redisController } from '@kikiutils/kiki-core-stack-pack/controllers/redis';
import type { AdminDocument } from '@kikiutils/kiki-core-stack-pack/models';
import type { UpdateQuery } from 'mongoose';

export default defineRouteHandler(async (request, response) => {
	const admin = request.locals.admin!.$clone();
	if (!(admin.totpSecret = (await redisController.twoFactorAuthentication.tempTOTPSecret.get(admin)) || admin.totpSecret)) throwAPIError(500, '系統錯誤，請重整頁面後再試！');
	const isEnabled = admin.twoFactorAuthenticationStatus.totp;
	admin.twoFactorAuthenticationStatus.totp = true;
	await requireTwoFactorAuthentication(request, true, true, admin);
	const updateQuery: UpdateQuery<AdminDocument> = { 'twoFactorAuthenticationStatus.totp': !isEnabled };
	if (isEnabled) updateQuery.$unset = { totpSecret: true };
	else updateQuery.totpSecret = admin.totpSecret;
	await admin.updateOne(updateQuery);
	await redisController.twoFactorAuthentication.tempTOTPSecret.del(admin);
	sendAPISuccessResponse(response);
});
