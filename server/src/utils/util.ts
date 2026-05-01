export const normalizeCardUid = (value: string) => value.toLowerCase();

export const omitUndefinedValues = <T extends Record<string, unknown>>(value: T) => {
	return Object.fromEntries(
		Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
	) as Partial<T>;
};
