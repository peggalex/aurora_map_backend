type JsonSerializableBaseType = string | number | null;
export type JsonSerializable =
	| JsonSerializableBaseType
	| Array<JsonSerializable>
	| { [key: string]: JsonSerializable };
