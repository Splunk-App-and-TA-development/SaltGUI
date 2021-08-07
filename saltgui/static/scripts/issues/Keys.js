/* global */

import {Issues} from "./Issues.js";

export class KeysIssues extends Issues {

  onGetIssues (pTable, pMsg) {

    const wheelKeyListAllPromise = this.api.getWheelKeyListAll();

    wheelKeyListAllPromise.then((pWheelKeyListAllData) => {
      Issues.removeCategory(pTable, "unaccepted-keys");
      KeysIssues._handleKeysWheelKeyListAll(pTable, pWheelKeyListAllData);
      pMsg.parentElement.removeChild(pMsg);
      return true;
    }, (pWheelKeyListAllMsg) => {
      Issues.addIssue(pTable, "unaccepted-keys", "collecting", "Could not collect list of unaccepted keys", pWheelKeyListAllMsg);
      pMsg.parentElement.removeChild(pMsg);
      return false;
    });
  }

  static _handleKeysWheelKeyListAll (pTable, pWheelKeyListAllData) {

    const allKeysDict = pWheelKeyListAllData.return[0].data.return;

    for (const minionId of allKeysDict.minions_pre) {
      Issues.addIssue(pTable, "unaccepted-keys", minionId, "Key for minion '" + minionId + "' is unaccepted");
    }
  }
}
