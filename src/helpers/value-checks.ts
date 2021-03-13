export const notNullOrUndefined = (val: any): boolean => val != null;

export const isNonEmptyArray = (arr: any): boolean => {
	return Array.isArray(arr) && arr.length > 0;
};
