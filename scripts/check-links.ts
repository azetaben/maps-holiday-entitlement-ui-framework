import {checkBrokenLinks} from '../utils/page-health-checks';
import {runPageCheck} from './page-health-runner';

void runPageCheck('Broken link check', checkBrokenLinks);
