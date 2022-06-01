export interface IValidateAddrResponse {
	isValid: boolean;
	ss58Prefix: number | null;
	network: string | null;
	accountId: string | null;
}
