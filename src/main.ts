import "./patches";
import {Config} from './config-loading';
import {setupContainer} from './dependency-container';
import {CONFIG, HTTP_SERVER, MONITORING_SYSTEM, RULING_SERVICE} from './injection-tokens';
import {Express} from 'express';
import {MonitoringSystem} from './monitoring-system/monitoring-system';
import {RulingService} from './ruling/ruling.service';

(async function main() {
    const container = await setupContainer();

    const config: Config = container.resolve(CONFIG);
    const httpServer: Express = container.resolve(HTTP_SERVER);
    httpServer.listen(config.http.port);

    const rulingSystem: RulingService = container.resolve(RULING_SERVICE);
    await rulingSystem.init();

    const monitoringSystem: MonitoringSystem = container.resolve(MONITORING_SYSTEM);
    await monitoringSystem.startMonitoring();

})();


