import { setReadonlyConstantToGlobalThis } from '@kikiutils/node';
import type { Context } from 'hono';
import { escapeRegExp } from 'lodash-es';
import { Types } from 'mongoose';

declare global {
	const getProcessedAPIRequestQueries: (ctx: Context, filterInFields?: Dict<string>, processObjectIdIgnoreFields?: string[]) => ProcessedAPIRequestQueries;
}

const baseFilterInFields = { states: 'state', types: 'type' } as const;
const processMaybeObjectIdArray = (array: any[]) => array.map((item) => processMaybeObjectIdValue(item));
const processMaybeObjectIdValue = (value: any) => (typeof value === 'string' && Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value);

function processRegexString(value: string) {
	try {
		new RegExp(value);
		return value;
	} catch {
		return escapeRegExp(value);
	}
}

setReadonlyConstantToGlobalThis('getProcessedAPIRequestQueries', (ctx: Context, filterInFields?: Dict<string>, processObjectIdIgnoreFields?: string[]) => {
	let filterQuery: Dict<any> = {};
	let selectFields: Nullable<Set<string>> = null;
	const queries: {
		filterQuery?: string;
		limit?: string;
		page?: string;
		selectFields?: string;
	} = ctx.req.query();

	// TODO: 重構與資料驗證並移除不該出現的搜尋條件
	if (queries.filterQuery) {
		let filterQueryData = JSON.parse(queries.filterQuery);
		if (filterQueryData.endAt) merge(filterQuery, { createdAt: { $lt: new Date(filterQueryData.endAt) } });
		if (filterQueryData.startAt) merge(filterQuery, { createdAt: { $gte: new Date(filterQueryData.startAt) } });
		Object.entries((filterQueryData = omit(filterQueryData, 'endAt', 'startAt'))).forEach(([key, value]) => {
			if (key.endsWith('Id') && !processObjectIdIgnoreFields?.includes(key) && delete filterQueryData[key]) filterQuery[key.slice(0, -2)] = processMaybeObjectIdValue(value);
			if (key.endsWith('Ids') && !filterInFields?.[key] && delete filterQueryData[key] && Array.isArray(value) && value.length) merge(filterQuery, { [key.slice(0, -3)]: { $in: processMaybeObjectIdArray(value) } });
			if (value?.$regex !== undefined && delete filterQueryData[key] && value.$regex) filterQuery[key] = ((value.$regex = processRegexString(value.$regex)), value);
			Object.entries({ ...baseFilterInFields, ...filterInFields }).forEach(([toCheckField, filterField]) => {
				if (key === toCheckField && delete filterQueryData[toCheckField] && Array.isArray(value) && value.length) merge(filterQuery, { [filterField]: { $in: processMaybeObjectIdArray(value) } });
			});
		});

		merge(filterQuery, filterQueryData);
	}

	if (queries.selectFields) selectFields = new Set(JSON.parse(queries.selectFields));
	const limit = Math.min(Math.abs(Number(queries.limit) || 10), 1000);
	const page = Math.abs(Number(queries.page) || 1);
	const offset = limit * page;
	return {
		filterQuery,
		limit,
		offset,
		page,
		selectFields: [...(selectFields || [])],
		skip: (page - 1) * limit
	};
});
