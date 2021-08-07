/* global */

export class Issues {

  static removeCategory (pTable, pCatName) {
    const rows = pTable.tBodies[0].childNodes;
    for (const tr in rows) {
      if (tr.myCatName === pCatName) {
        tr.parentNode.deleteChild(tr);
      }
    }
  }

  static addIssue (pTable, pCatName, pIssueName, pIssueTitle, pIssueData) {
    let theTr = null;

    const rows = pTable.tBodies[0].childNodes;
    for (const tr in rows) {
      if (tr.myCatName === pCatName) {
        theTr = tr;
      }
    }

    if (theTr === null) {
      theTr = document.createElement("tr");
      const catTd = document.createElement("td");
      catTd.classList.add("category");
      theTr.appendChild(catTd);
      const keyTd = document.createElement("td");
      keyTd.classList.add("key");
      theTr.appendChild(keyTd);
      const descTd = document.createElement("td");
      descTd.classList.add("desc");
      theTr.appendChild(descTd);
      pTable.tBodies[0].appendChild(theTr);
    }

    const catTd = theTr.querySelector(".category");
    const keyTd = theTr.querySelector(".key");
    const descTd = theTr.querySelector(".desc");

    catTd.innerText = pCatName;
    keyTd.innerText = pIssueName;
    descTd.innerText = pIssueTitle;

    theTr.myCatName = pCatName;
    theTr.myIssueName = pIssueName;
    theTr.myIssueData = pIssueData;
  }
}
