type ReadAutoCompletedLocation = {
	name: string | null;
	region: string | null;
	country: string | null;
	lat: number;
	long: number;
};

export type ReadAutoCompleteLocations = ReadAutoCompletedLocation[];
