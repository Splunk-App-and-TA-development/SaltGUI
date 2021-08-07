/* global */

import {BeaconsIssues} from "../issues/Beacons.js";
import {JobsIssues} from "../issues/Jobs.js";
import {KeysIssues} from "../issues/Keys.js";
import {Panel} from "./Panel.js";
import {SchedulesIssues} from "../issues/Schedules.js";

export class IssuesPanel extends Panel {

  constructor () {
    super("issues");

    this.addTitle("Issues");
    this.addSearchButton();
    this.addTable(["Category", "Key", "Description"]);
    this.setTableSortable("Category", "asc");
    // this.addMsg();

    this.keysIssues = new KeysIssues();
    this.jobsIssues = new JobsIssues();
    this.beaconsIssues = new BeaconsIssues();
    this.schedulesIssues = new SchedulesIssues();
  }

  onShow () {
    this.keysIssues.api = this.api;
    this.keysIssues.onGetIssues(this.table, this.makeIssuesStatus("KEYS"));
    this.jobsIssues.api = this.api;
    this.jobsIssues.onGetIssues(this.table, this.makeIssuesStatus("JOBS"));
    this.beaconsIssues.api = this.api;
    this.beaconsIssues.onGetIssues(this.table, this.makeIssuesStatus("BEACONS"));
    this.schedulesIssues.api = this.api;
    this.schedulesIssues.onGetIssues(this.table, this.makeIssuesStatus("SCHEDULES"));

    // this.setMsg("hello");
  }

  makeIssuesStatus (pTitle) {
    const msg = document.createElement("div");
    msg.classList.add("msg");
    msg.innerText = "(loading info for " + pTitle + ")";
    this.div.appendChild(msg);
    return msg;
  }
}
