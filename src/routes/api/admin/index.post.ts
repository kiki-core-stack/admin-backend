import { throwApiError } from '@kiki-core-stack/pack/hono-backend/libs/api';
import { apiZValidator } from '@kiki-core-stack/pack/hono-backend/libs/api/zod-validator';
import * as z from '@kiki-core-stack/pack/libs/zod';
import { AdminModel } from '@kiki-core-stack/pack/models/admin';
import type { AdminData } from '@kiki-core-stack/pack/types/data/admin';

import { defaultHonoFactory } from '@/core/constants/hono';

export const jsonSchema = z.object({
    account: z.string().trim().min(1).max(16),
    email: z.string().trim().email().toLowerCase().optional(),
    enabled: z.boolean(),
    password: z.string().trim().length(128).optional(),
}) satisfies ZodValidatorType<AdminData>;

export default defaultHonoFactory.createHandlers(
    apiZValidator('json', jsonSchema),
    async (ctx) => {
        const data = ctx.req.valid('json');
        if (data.password!.length !== 128) throwApiError(400);
        await AdminModel.create(data);
        return ctx.createApiSuccessResponse();
    },
);
