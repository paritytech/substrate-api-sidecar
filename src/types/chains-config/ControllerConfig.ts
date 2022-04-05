import LRU from 'lru-cache';

import { controllers } from '../../controllers';
import { IBlock } from '../../types/responses';
import { IOption } from '../util';

/**
 * Controller mounting configuration as an object where the keys are the
 * controller class names and the values are booleans indicating whether or not
 * to include the controller.
 *
 * There is an additional `finalizes` field that is used to indicate wether or
 * not a chain has finalized blocks. Practically, this only affects if
 * `BlocksController` defaults to getFinalizedHead (in the case it finalizes) or
 *  getHeader (in the case it does not finalize)
 */
export interface ControllerConfig {
	/**
	 * Controller class names to be included
	 */
	controllers: (keyof typeof controllers)[];
	/**
	 * Options relating to how the controllers are configured.
	 */
	options: {
		/**
		 * Wether or not the chain finalizes blocks
		 */
		finalizes: boolean;
		minCalcFeeRuntime: IOption<number>;
		blockStore: LRU<string, IBlock>;
	};
}
