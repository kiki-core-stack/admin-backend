import { zValidator as _zValidator } from '@hono/zod-validator';
import { setReadonlyConstantToGlobalThis } from '@kikiutils/node';

declare global {
	const zValidator: typeof _zValidator;
}

setReadonlyConstantToGlobalThis('zValidator', _zValidator);