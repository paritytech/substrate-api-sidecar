import { controllers } from '../../controllers';

/**
 * Controller mounting configuration as an object where the keys are the
 * controller class names and the values are booleans indicating whether or not
 * to include the controller.
 */
export type ControllerConfig = Record<keyof typeof controllers, boolean>;
