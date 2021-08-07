/* global */

import {Issues} from "./Issues.js";

export class SchedulesIssues extends Issues {

  onGetIssues (pTable, pMsg) {

    const localScheduleListPromise = this.api.getLocalScheduleList(null);

    localScheduleListPromise.then((pLocalScheduleListData) => {
      Issues.removeCategory(pTable, "disabled-schedulers");
      Issues.removeCategory(pTable, "disabled-schedules");
      SchedulesIssues._handleLocalScheduleList(pTable, pLocalScheduleListData);
      pMsg.parentElement.removeChild(pMsg);
      return true;
    }, (pLocalScheduleListMsg) => {
      Issues.addIssue(pTable, "disabled-schedulers", "collecting", "Could not collect list of schedulers", pLocalScheduleListMsg);
      Issues.addIssue(pTable, "disabled-schedules", "collecting", "Could not collect list of schedules", pLocalScheduleListMsg);
      pMsg.parentElement.removeChild(pMsg);
      return false;
    });
  }

  static _handleLocalScheduleList (pTable, pLocalScheduleListData) {

    const allSchedules = pLocalScheduleListData.return[0];

    for (const minionId in allSchedules) {
      const minionData = allSchedules[minionId];
      for (const key in minionData) {
        if (key === "enabled") {
          // scheduler flag
          if (minionData.enabled === false) {
            Issues.addIssue(pTable, "disabled-schedulers", minionId, "Scheduler on '" + minionId + "' is disabled");
          }
        } else {
          const jobData = minionData[key];
          if ("enabled" in jobData && jobData.enabled === false) {
            Issues.addIssue(pTable, "disabled-schedules", minionId + "-" + key, "Schedule '" + key + "' on '" + minionId + "' is disabled");
          }
        }
      }
    }
  }
}
