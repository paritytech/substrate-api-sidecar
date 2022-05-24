export interface IValidateAddrResponse {
	isValid: boolean;
	ss58Prefix: number | null;
	networkName: string | null;
	accountId: string | null;
}
