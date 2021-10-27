import parasParas8400000 from './8400000.json';
import parasParas9400000 from './9400000.json';
import parasParas9800000 from './9800000.json';

export const parasParasEndpoints = [
    ['/experimental/paras?at=8400000', JSON.stringify(parasParas8400000)],
    ['/experimental/paras?at=9400000', JSON.stringify(parasParas9400000)],
    ['/experimental/paras?at=9800000', JSON.stringify(parasParas9800000)],
];
