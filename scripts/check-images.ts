import {checkImages} from '../utils/page-health-checks';
import {runPageCheck} from './page-health-runner';

void runPageCheck('Image check', checkImages);
