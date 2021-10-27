import parasLeaseInfo8500000 from './8500000.json';
import parasLeaseInfo9000000 from './9000000.json';
import parasLeaseInfo9800000 from './9800000.json';

export const parasLeaseInfoEndpoints = [
    ['/experimental/paras/2007/lease-info?at=8500000', JSON.stringify(parasLeaseInfo8500000)],
    ['/experimental/paras/2000/lease-info?at=9000000', JSON.stringify(parasLeaseInfo9000000)],
    ['/experimental/paras/2023/lease-info?at=9800000', JSON.stringify(parasLeaseInfo9800000)],
];
