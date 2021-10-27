import parasCrowdloans8200000 from './8200000.json';
import parasCrowdloans9800000 from './9800000.json';

export const parasCrowdloansEndpoints = [
    ['/experimental/paras/crowdloans?at=8200000', JSON.stringify(parasCrowdloans8200000)],
    ['/experimental/paras/crowdloans?at=9800000', JSON.stringify(parasCrowdloans9800000)],
];
