// import { DecoratedMeta } from '@polkadot/metadata/decorate/types';

import { AbstractInt } from '@polkadot/types/codec/AbstractInt';
import { WeightPerClass } from '@polkadot/types/interfaces';

import { controllers } from '../../controllers';
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
	 * Controller class names and wether or not to include them
	 */
	controllers: Record<keyof typeof controllers, boolean>;
	/**
	 * Options relating to how the controllers are configured.
	 */
	options: {
		/**
		 * Wether or not the chain finalizes blocks
		 */
		finalizes: boolean;
	};
}

/**
 * Used in BlocksService, to persist decorated metadata to avoid expensive calls
 */
export interface CacheType {
	decorated?: CacheDecorated;
	runtimeVersion?: number;
}

export interface CacheDecorated {
	consts: {
		system: {
			extrinsicBaseWeight?: AbstractInt;
			blockWeights?: {
				perClass: {
					normal: WeightPerClass;
					mandatory: WeightPerClass;
					operational: WeightPerClass;
				};
			};
		};
	};
}

/**
 * Object pointer to AbstractController that allows access to the cache.
 */
export interface That {
	cache: CacheType;
}
