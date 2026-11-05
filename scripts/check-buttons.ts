import {checkButtons} from '../utils/page-health-checks';
import {runPageCheck} from './page-health-runner';

void runPageCheck('Button check', checkButtons);
