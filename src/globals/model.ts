import type { Request } from '@kikiutils/hyper-express';
import type { QueryOptions, PaginateOptions, PopulateOptions } from 'mongoose';

declare global {
	const getModelDocumentByRouteIdAndDelete: <RawDocType, QueryHelpers, InstanceMethodsAndOverrides>(
		request: Request,
		model: BaseMongoosePaginateModel<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>,
		options?: Nullable<QueryOptions<RawDocType>>,
		beforeDelete?: (document: MongooseHydratedDocument<RawDocType, InstanceMethodsAndOverrides, QueryHelpers>) => any
	) => Promise<void>;

	const getModelDocumentByRouteIdAndUpdateBooleanField: <RawDocType, QueryHelpers, InstanceMethodsAndOverrides>(
		request: Request,
		model: BaseMongoosePaginateModel<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>,
		allowedFields: string[],
		options?: Nullable<QueryOptions<RawDocType>>,
		beforeUpdate?: (document: MongooseHydratedDocument<RawDocType, InstanceMethodsAndOverrides, QueryHelpers>, field: string, value: boolean) => any
	) => Promise<void>;

	const modelToPaginatedData: {
		<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>(
			request: Request,
			model: BaseMongoosePaginateModel<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>,
			paginateOptions?: PaginateOptions,
			filterInFields?: Dict<string>,
			processObjectIdIgnoreFields?: string[]
		): Promise<any>;

		<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>(model: BaseMongoosePaginateModel<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>, queries: ProcessedApiRequestQueries, paginateOptions?: PaginateOptions): Promise<any>;
	};
}

Object.defineProperty(globalThis, 'getModelDocumentByRouteIdAndDelete', {
	configurable: false,
	async value<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>(
		request: Request,
		model: BaseMongoosePaginateModel<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>,
		options?: Nullable<QueryOptions<RawDocType>>,
		beforeDelete?: (document: MongooseHydratedDocument<RawDocType, InstanceMethodsAndOverrides, QueryHelpers>) => any
	) {
		const document = await model.findByRouteIdOrThrowNotFoundError(request, undefined, null, options);
		// @ts-expect-error
		await beforeDelete?.(document);
		await document.deleteOne(options || undefined);
	},
	writable: false
});

Object.defineProperty(globalThis, 'getModelDocumentByRouteIdAndUpdateBooleanField', {
	configurable: false,
	async value<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>(
		request: Request,
		model: BaseMongoosePaginateModel<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>,
		allowedFields: string[],
		options?: Nullable<QueryOptions<RawDocType>>,
		beforeUpdate?: (document: MongooseHydratedDocument<RawDocType, InstanceMethodsAndOverrides, QueryHelpers>, field: string, value: boolean) => any
	) {
		const document = await model.findByRouteIdOrThrowNotFoundError(request, undefined, null, options);
		const { field, value } = await request.json<{ field: string; value: boolean }>();
		if (!allowedFields.includes(field)) throwApiError(400);
		// @ts-expect-error
		await beforeUpdate?.(document, field, !!value);
		// @ts-expect-error
		await document.updateOne({ [`${field}`]: !!value });
	},
	writable: false
});

Object.defineProperty(globalThis, 'modelToPaginatedData', {
	configurable: false,
	async value<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>(
		modelOrRequest: BaseMongoosePaginateModel<RawDocType, QueryHelpers, InstanceMethodsAndOverrides> | Request,
		modelOrQueries: BaseMongoosePaginateModel<RawDocType, QueryHelpers, InstanceMethodsAndOverrides> | ProcessedApiRequestQueries,
		paginateOptions?: PaginateOptions,
		filterInFields?: Dict<string>,
		processObjectIdIgnoreFields?: string[]
	) {
		let model: BaseMongoosePaginateModel<RawDocType, QueryHelpers, InstanceMethodsAndOverrides>;
		let queries: ProcessedApiRequestQueries;
		if ('json' in modelOrRequest) {
			// @ts-expect-error
			model = modelOrQueries;
			queries = getProcessedApiRequestQueries(modelOrRequest as Request, filterInFields, processObjectIdIgnoreFields);
		} else {
			model = modelOrRequest;
			// @ts-expect-error
			queries = modelOrQueries;
		}

		if (paginateOptions?.populate && queries.selectFields.length) paginateOptions.populate = [paginateOptions.populate].flat().filter((item) => queries.selectFields.includes(typeof item === 'object' ? item.path : item)) as PopulateOptions[] | string[];
		const paginateResult = await model.paginate(queries.filterQuery, {
			...paginateOptions,
			limit: queries.limit,
			page: queries.page,
			select: queries.selectFields,
			sort: paginateOptions?.sort || { _id: -1 }
		});

		return { count: paginateResult.totalDocs, data: paginateResult.docs };
	},
	writable: false
});
