import { AdminLogModel } from '@kikiutils/kiki-core-stack-pack/models';

export default defaultHonoFactory.createHandlers(async (ctx) => {
	return ctx.createAPISuccessResponse(
		await modelToPaginatedData(ctx, AdminLogModel, {
			populate: { path: 'admin', select: ['-_id', 'account'] },
			options: { readPreference: 'secondaryPreferred' }
		})
	);
});
