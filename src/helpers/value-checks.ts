export const isNullOrUndefined = (val: any): boolean => val != null;

export const isNonEmptyArray = (arr: any): boolean => {
	return Array.isArray(arr) && arr.length > 0;
};

export const isNonEmptyObject = (obj: any): boolean => {
	return !isNullOrUndefined(obj)
		&& typeof obj === 'object'
		&& Object.keys(obj).length > 0;
};
