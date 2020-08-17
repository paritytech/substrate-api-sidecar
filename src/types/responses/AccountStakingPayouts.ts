import { IAt, IEraPayouts } from '.';

export interface IAccountStakingPayouts {
	at: IAt;
	erasPayouts: (IEraPayouts | { message: string })[];
}
