/* global document */

import {DropDownMenuCmd} from "../DropDownCmd.js";
import {Output} from "../output/Output.js";
import {Panel} from "./Panel.js";
import {SchedulesPanel} from "./Schedules.js";
import {Utils} from "../Utils.js";

export class SchedulesMinionPanel extends Panel {

  constructor () {
    super("schedules-minion");

    this.addTitle("Schedules on ...");
    this.addPanelMenu();
    this._addPanelMenuItemScheduleEnableWhenNeeded();
    this._addPanelMenuItemScheduleDisableWhenNeeded();
    this._addPanelMenuItemScheduleAddInterval();
    this._addPanelMenuItemScheduleAddCron();
    this._addPanelMenuItemScheduleAddOnce();
    this.addSearchButton();
    this.addCloseButton();
    this.addTable(["Name", "-menu-", "Details"]);
    this.setTableSortable("Name", "asc");
    this.setTableClickable();
    this.addMsg();
  }

  onShow () {
    const minionId = decodeURIComponent(Utils.getQueryParam("minionid"));

    // preliminary title
    this.updateTitle("Schedules on " + minionId);

    const localScheduleListPromise = this.api.getLocalScheduleList(minionId);

    localScheduleListPromise.then((pLocalScheduleListData) => {
      this._handleLocalScheduleList(pLocalScheduleListData, minionId);
      return true;
    }, (pLocalScheduleListMsg) => {
      this._handleLocalScheduleList(JSON.stringify(pLocalScheduleListMsg), minionId);
      return false;
    });
  }

  _handleLocalScheduleList (pLocalScheduleList, pMinionId) {
    if (this.showErrorRowInstead(pLocalScheduleList, pMinionId)) {
      return;
    }

    let schedules = pLocalScheduleList.return[0][pMinionId];
    schedules = SchedulesPanel.fixSchedulesMinion(schedules);

    this.schedulesEnabled = schedules.enabled;

    if (schedules && schedules.enabled === false) {
      this.updateTitle("Schedules on " + pMinionId + " (disabled)");
    }

    if (schedules === undefined) {
      this.setMsg("Unknown minion '" + pMinionId + "'");
      return;
    }
    if (schedules === false) {
      this.setMsg("Minion '" + pMinionId + "' did not answer");
      return;
    }

    const keys = Object.keys(schedules.schedules).sort();
    for (const scheduleName of keys) {

      const schedule = schedules.schedules[scheduleName];

      // simplify the schedule information
      if ("name" in schedule) {
        delete schedule.name;
      }
      if (schedule.enabled === true) {
        delete schedule.enabled;
      }
      if (schedule.jid_include === true) {
        delete schedule.jid_include;
      }
      if (schedule.maxrunning === 1) {
        delete schedule.maxrunning;
      }

      const tr = document.createElement("tr");

      const nameTd = Utils.createTd("schedule-name", scheduleName);
      tr.appendChild(nameTd);

      const scheduleMenu = new DropDownMenuCmd(tr, true);
      const scheduleModifyCmdArr = ["schedule.modify", scheduleName];
      for (let key in schedule) {
        const value = schedule[key];
        if (key === "args") {
          key = "job_args";
        } else if (key === "kwargs") {
          key = "job_kwargs";
        }
        scheduleModifyCmdArr.push(key + "=", value);
      }
      this._addMenuItemModifyJob(scheduleMenu, pMinionId, scheduleModifyCmdArr);
      this._addMenuItemScheduleEnableJobWhenNeeded(scheduleMenu, pMinionId, scheduleName, schedule);
      this._addMenuItemScheduleDisableJobWhenNeeded(scheduleMenu, pMinionId, scheduleName, schedule);
      this._addMenuItemScheduleDeleteJob(scheduleMenu, pMinionId, scheduleName);
      this._addMenuItemScheduleRunJob(scheduleMenu, pMinionId, scheduleName, schedule);

      // menu comes before this data on purpose
      const scheduleValue = Output.formatObject(schedule);
      const scheduleValueTd = Utils.createTd("schedule-value", scheduleValue);
      if (schedule.enabled === false) {
        scheduleValueTd.classList.add("schedule-disabled");
      }
      if (schedules.enabled === false) {
        scheduleValueTd.classList.add("schedule-disabled");
      }
      tr.appendChild(scheduleValueTd);

      const tbody = this.table.tBodies[0];
      tbody.appendChild(tr);

      tr.addEventListener("click", (pClickEvent) => {
        this.runCommand(pMinionId, scheduleModifyCmdArr);
        pClickEvent.stopPropagation();
      });
    }

    const txt = Utils.txtZeroOneMany(keys.length,
      "No schedules", "{0} schedule", "{0} schedules");
    this.setMsg(txt);
  }

  _addPanelMenuItemScheduleEnableWhenNeeded () {
    this.panelMenu.addMenuItemCmd(() => {
      if (this.schedulesEnabled) {
        return null;
      }
      return "Enable scheduler...";
    }, () => {
      const minionId = decodeURIComponent(Utils.getQueryParam("minionid"));
      this.runCommand(minionId, ["schedule.enable"]);
    });
  }

  _addPanelMenuItemScheduleDisableWhenNeeded () {
    this.panelMenu.addMenuItemCmd(() => {
      if (!this.schedulesEnabled) {
        return null;
      }
      return "Disable scheduler...";
    }, () => {
      const minionId = decodeURIComponent(Utils.getQueryParam("minionid"));
      this.runCommand(minionId, ["schedule.disable"]);
    });
  }

  _addPanelMenuItemScheduleAddInterval () {
    this.panelMenu.addMenuItemCmd("Add interval schedule...", () => {
      const minionId = decodeURIComponent(Utils.getQueryParam("minionid"));
      this.runCommand(minionId, [
        "schedule.add",
        "<name>",
        "function=", "<function>",
        "seconds=", "<seconds>",
        "minutes=", "<minutes>",
        "hours=", "<hours>",
        "days=", "<days>"
      ]);
    });
  }

  _addPanelMenuItemScheduleAddCron () {
    this.panelMenu.addMenuItemCmd("Add cron schedule...", () => {
      const minionId = decodeURIComponent(Utils.getQueryParam("minionid"));
      this.runCommand(minionId, [
        "schedule.add",
        "<name>",
        "function=", "<function>",
        "cron=", "<cron>"
      ]);
    });
  }

  _addPanelMenuItemScheduleAddOnce () {
    this.panelMenu.addMenuItemCmd("Add once schedule...", () => {
      const minionId = decodeURIComponent(Utils.getQueryParam("minionid"));
      this.runCommand(minionId, [
        "schedule.add",
        "<name>",
        "function=", "<function>",
        "once=", new Date().toISOString().
          replace(/[.].*/, ""),
        "once_format=", "%Y-%m-%dT%H:%M:%S"
      ]);
    });
  }

  _addMenuItemModifyJob (pMenu, pMinionId, scheduleModifyCmdArr) {
    pMenu.addMenuItemCmd("Modify job...", () => {
      this.runCommand(pMinionId, scheduleModifyCmdArr);
    });
  }

  _addMenuItemScheduleEnableJobWhenNeeded (pMenu, pMinionId, pJobName, schedule) {
    if (schedule.enabled !== false) {
      return;
    }
    pMenu.addMenuItemCmd("Enable job...", () => {
      this.runCommand(pMinionId, ["schedule.enable_job", pJobName]);
    });
  }

  _addMenuItemScheduleDisableJobWhenNeeded (pMenu, pMinionId, pJobName, schedule) {
    if (schedule.enabled === false) {
      return;
    }
    pMenu.addMenuItemCmd("Disable job...", () => {
      this.runCommand(pMinionId, ["schedule.disable_job", pJobName]);
    });
  }

  _addMenuItemScheduleDeleteJob (pMenu, pMinionId, pJobName) {
    pMenu.addMenuItemCmd("Delete job...", () => {
      this.runCommand(pMinionId, ["schedule.delete", pJobName]);
    });
  }

  _addMenuItemScheduleRunJob (pMenu, pMinionId, pJobName, schedule) {
    pMenu.addMenuItemCmd("Run job...", () => {
      const scheduleRunJobCmdArr = ["schedule.run_job"];
      if (schedule.enabled === false) {
        scheduleRunJobCmdArr.push("force=", true);
      }
      scheduleRunJobCmdArr.push(pJobName);
      this.runCommand(pMinionId, scheduleRunJobCmdArr);
    });
  }
}
