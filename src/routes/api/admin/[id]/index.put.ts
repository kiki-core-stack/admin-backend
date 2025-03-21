import { AdminModel } from '@kiki-core-stack/pack/models/admin';
import type { AdminDocument } from '@kiki-core-stack/pack/models/admin';
import type { UpdateQuery } from 'mongoose';

import { jsonSchema } from '../index.post';

export default defaultHonoFactory.createHandlers(
    apiZValidator('json', jsonSchema),
    async (ctx) => {
        const admin = await AdminModel.findByRouteIdOrThrowNotFoundError(ctx);
        const updateQuery: UpdateQuery<AdminDocument> = ctx.req.valid('json');
        updateQuery.enabled = updateQuery.enabled || admin.id === ctx.admin!.id;
        if (!updateQuery.email) updateQuery.$unset = { email: true };
        await admin.updateOne(updateQuery);
        return ctx.createApiSuccessResponse();
    },
);
