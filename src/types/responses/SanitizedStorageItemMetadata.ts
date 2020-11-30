export interface ISanitizedStorageItemMetadata {
	// name property corresponds to the storageItemId
	name: string;
	modifier: string;
	type: unknown;
	fallback: string;
	documentation: string[] | string;
}
