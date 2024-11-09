export const getFetchWithRetry = (maxRetries: number) => {
	const fetchWithRetry = async (
		fetchParams: Parameters<typeof fetch>,
		attempt = 1
	): Promise<Response> => {
		try {
			return await fetch(...fetchParams);
		} catch (e) {
			console.warn(
				`Fetch failed (attempt=${attempt}), retrying ${fetchParams[0]}`
			);
			console.error(e);
			if (attempt < maxRetries) {
				return fetchWithRetry(fetchParams, attempt + 1);
			} else {
				throw Error(
					`Exceeded max retries (attempt=${attempt}): ${fetchParams[0]}`
				);
			}
		}
	};
	return fetchWithRetry;
};
