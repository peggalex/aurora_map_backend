export function objectFromEntriesTyped<TKey extends string, TValue>(
	entries: [TKey, TValue][]
): { readonly [key in TKey]: TValue } {
	return Object.fromEntries(entries) as { readonly [key in TKey]: TValue };
}
