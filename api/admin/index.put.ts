import { AdminModel } from '@kikiutils/el-plus-admin-pack/models';

import { saveAdminDataValidator } from '@/validators/admin';

export default defineEventHandler(async (event) => {
	const data = await saveAdminDataValidator(event);
	if (data.password?.length !== 128) throw new ApiError(400);
	await AdminModel.create(data);
	return createResponseData();
});
