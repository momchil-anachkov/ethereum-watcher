import {asFunction, AwilixContainer} from 'awilix';

import * as awilix from 'awilix';
import {setupLogger} from './logger';

export const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
    strict: true,
});

const LOGGER = Symbol('logger');

container.register(LOGGER, asFunction(setupLogger));
