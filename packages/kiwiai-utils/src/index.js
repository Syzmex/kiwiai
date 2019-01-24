//@flow

import forkTarget from './fork';
import composeTarget from './compose';
import getConfigTarget from './getConfig';

export const fork: typeof forkTarget = forkTarget;
export const compose: typeof composeTarget = composeTarget;
export const getConfig: typeof getConfigTarget = getConfigTarget;
