import { AdminModel } from '@kikiutils/kiki-core-stack-pack/models';
import type { AdminData } from '@kikiutils/kiki-core-stack-pack/types/data/admin';
import type { ZodType } from 'zod';

export const jsonSchema = z.object({
	account: z.string().trim().max(16).min(1),
	email: z.string().trim().email().toLowerCase().optional(),
	enabled: z.boolean(),
	name: z.string().trim().max(16).min(1),
	password: z.string().trim().length(128).optional(),
	twoFactorAuthenticationStatus: z.object({ emailOtp: z.boolean(), totp: z.boolean() })
}) satisfies ZodType<OmitMongooseTimestampAndOtherFields<AdminData, 'id'>>;

export default defineRouteHandlerWithZodValidator({ json: jsonSchema }, async (request) => {
	const data = request.locals.verifiedData.json;
	if (data.password?.length !== 128) throwApiError(400);
	await AdminModel.create(data);
});
