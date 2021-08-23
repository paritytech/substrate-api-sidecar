import block943438 from './blocks/943438.json';
import block1603025 from './blocks/1603025.json';
import block1662525 from './blocks/1662525.json';
import block1993625 from './blocks/1993625.json';
import block2392625 from './blocks/2392625.json';
import block3592619 from './blocks/3592619.json';
import block3892620 from './blocks/3892620.json';
import block4092619 from './blocks/4092619.json';
import block4392619 from './blocks/4392619.json';
import block4947391 from './blocks/4947391.json';
import block5705186 from './blocks/5705186.json';

const polkadotBlockEndpoints = [
	['/blocks/943438', JSON.stringify(block943438)], //v17
	['/blocks/1603025', JSON.stringify(block1603025)], //v18
	['/blocks/1662525', JSON.stringify(block1662525)], //v23
	['/blocks/1993625', JSON.stringify(block1993625)], //v24
	['/blocks/2392625', JSON.stringify(block2392625)], //v25
	['/blocks/3592619', JSON.stringify(block3592619)], //v26
	['/blocks/3892620', JSON.stringify(block3892620)], //v27
	['/blocks/4092619', JSON.stringify(block4092619)], //v28
	['/blocks/4392619', JSON.stringify(block4392619)], //v29
	['/blocks/4947391', JSON.stringify(block4947391)], //v30
	['/blocks/5705186', JSON.stringify(block5705186)], //v9050
];


export const polkadotEndpoints = {
	blocks: polkadotBlockEndpoints
}