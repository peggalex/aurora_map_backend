import { JsonSerializable } from "./types/JsonSerializable";

export interface IModuleQueryCommand {
	execute(request: JsonSerializable): Promise<JsonSerializable>;
}
