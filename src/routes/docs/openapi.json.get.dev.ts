import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';

import configs from '@/configs';
import { zodOpenApiRegistry } from '@/core/constants/zod-openapi';

export default defaultHonoFactory.createHandlers((ctx) => {
    const generator = new OpenApiGeneratorV31(zodOpenApiRegistry.definitions);
    ctx.header('content-type', 'application/json');
    // @ts-expect-error Ignore this error.
    return ctx.body(JSON.stringify(generator.generateDocument(configs.openApi), null, 2));
});
