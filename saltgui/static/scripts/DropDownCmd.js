/* global */

import {DropDownMenu} from "./DropDown.js";

export class DropDownMenuCmd extends DropDownMenu {
  // constructor (pParentElement) {
  //   super(pParentElement);
  // }

  addMenuItemCmd (pTitle, pCallBack) {
    const menuItem = super.addMenuItem(
      null,
      pTitle,
      pCallBack
    );
    return menuItem;
  }
}
