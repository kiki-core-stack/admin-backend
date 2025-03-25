import { mongooseConnections } from '@kiki-core-stack/pack/constants/mongoose';
import { AdminModel } from '@kiki-core-stack/pack/models/admin';
import { AdminSessionModel } from '@kiki-core-stack/pack/models/admin/session';

export default defaultHonoFactory.createHandlers(async (ctx) => {
    return await mongooseConnections.default!.transaction(async (session) => {
        await getModelDocumentByRouteIdAndUpdateBooleanField(
            ctx,
            AdminModel,
            ['enabled'],
            { session },
            async (admin, field) => {
                if (field === 'enabled') {
                    if (admin._id === ctx.adminId) throwApiError(400, '無法變更自己的啟用狀態！');
                    await AdminSessionModel.deleteMany({ admin }, { session });
                }
            },
        );

        return ctx.createApiSuccessResponse();
    });
});
