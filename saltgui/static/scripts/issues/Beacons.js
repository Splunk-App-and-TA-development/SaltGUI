/* global */

import {Issues} from "./Issues.js";

export class BeaconsIssues extends Issues {

  onGetIssues (pTable, pMsg) {

    const localBeaconsListPromise = this.api.getLocalBeaconsList(null);

    localBeaconsListPromise.then((pLocalBeaconsListData) => {
      Issues.removeCategory(pTable, "disabled-schedulers");
      Issues.removeCategory(pTable, "disabled-schedules");
      BeaconsIssues._handleLocalBeaconsList(pTable, pLocalBeaconsListData);
      pMsg.parentElement.removeChild(pMsg);
      return true;
    }, (pLocalBeaconsListMsg) => {
      Issues.addIssue(pTable, "disabled-schedulers", "collecting", "Could not collect list of schedulers", pLocalBeaconsListMsg);
      Issues.addIssue(pTable, "disabled-schedules", "collecting", "Could not collect list of schedules", pLocalBeaconsListMsg);
      pMsg.parentElement.removeChild(pMsg);
      return false;
    });
  }

  static simplify (beaconData) {
    if (typeof beaconData === "object" && Array.isArray(beaconData)) {
      // beacon data is strange
      // it comes in an array of objects
      let newBeaconData = {};
      for (const beaconDataItem of beaconData) {
        newBeaconData = Object.assign(newBeaconData, beaconDataItem);
      }
      return newBeaconData;
    }
    return beaconData;
  }

  static _handleLocalBeaconsList (pTable, pLocalBeaconsListData) {

    const allBeacons = pLocalBeaconsListData.return[0];

    for (const minionId in allBeacons) {
      const minionData = allBeacons[minionId];
      for (const beaconName in minionData) {
        if (beaconName === "enabled") {
          // beacons flag
          if (minionData.enabled === false) {
            Issues.addIssue(pTable, "disabled-beacons", minionId, "The beacons on minion '" + minionId + "' are disabled");
          }
        } else {
          const beaconData = BeaconsIssues.simplify(minionData[beaconName]);
          if ("enabled" in beaconData && beaconData.enabled === false) {
            Issues.addIssue(pTable, "disabled-beacon", minionId + "-" + beaconName, "Beacon '" + beaconName + "' on '" + minionId + "' is disabled");
          }
        }
      }
    }
  }
}
