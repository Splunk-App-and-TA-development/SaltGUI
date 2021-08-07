/* global */

import {Issues} from "./Issues.js";

export class JobsIssues extends Issues {

  onGetIssues (pTable, pMsg) {

    // never mind
    // jobs.list_jobs does not return job status info
    pMsg.parentElement.removeChild(pMsg);
    return;

    /* eslint-disable no-unreachable */

    const runnerJobsListJobsPromise = this.api.getRunnerJobsListJobs();

    runnerJobsListJobsPromise.then((pRunnerJobsListJobsData) => {
      Issues.removeCategory(pTable, "failed-jobs");
      JobsIssues._handleRunnerJobsListJobs(pTable, pRunnerJobsListJobsData);
      pMsg.parentElement.removeChild(pMsg);
      return true;
    }, (pRunnerJobsListJobsMsg) => {
      Issues.addIssue(pTable, "failed-jobs", "collecting", "Could not collect list of jobs", pRunnerJobsListJobsMsg);
      pMsg.parentElement.removeChild(pMsg);
      return false;
    });

    /* eslint-enable no-unreachable */
  }

  static _handleRunnerJobsListJobs (pTable, pRunnerJobsListJobsData) {

    const allJobsDict = pRunnerJobsListJobsData.return[0];

    for (const jobId in allJobsDict) {
      Issues.addIssue(pTable, "failed-jobs", jobId, "Job '" + jobId + "' failed");
    }

    // TODO dummy
    Issues.addIssue(pTable, "failed-jobs", "<jobId>", "Job '<jobId>' failed");
  }
}
