// ═══════════════════════════════════════════════════════════
//  Google Apps Script — ร้านขนม API
//  วางไว้ใน Google Sheet → Extensions → Apps Script
//  แล้ว Deploy → New deployment → Web app
//  Execute as: Me | Who has access: Anyone
// ═══════════════════════════════════════════════════════════

const SHEET_NAME = "transactions";
const HEADERS = ["id","date","type","src","detail","out","inp","createdAt"];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length)
      .setBackground("#1a1a2e")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
    sh.setColumnWidth(1, 80);
    sh.setColumnWidth(2, 110);
    sh.setColumnWidth(3, 160);
    sh.setColumnWidth(4, 110);
    sh.setColumnWidth(5, 280);
    sh.setColumnWidth(6, 100);
    sh.setColumnWidth(7, 100);
    sh.setColumnWidth(8, 160);
  }
  return sh;
}

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  try {
    const action = e.parameter.action || (e.postData ? JSON.parse(e.postData.contents).action : "get");
    let result;

    if (action === "get") {
      result = getAllTx();
    } else if (action === "add") {
      const body = JSON.parse(e.postData.contents);
      result = addTx(body.tx);
    } else if (action === "delete") {
      const body = JSON.parse(e.postData.contents);
      result = deleteTx(body.id);
    } else if (action === "ping") {
      result = { ok: true, time: new Date().toISOString() };
    } else {
      result = { error: "unknown action" };
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getAllTx() {
  const sh = getSheet();
  const rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1).map(r => ({
    id:        r[0],
    date:      r[1],
    type:      r[2],
    src:       r[3],
    detail:    r[4],
    out:       Number(r[5]) || 0,
    inp:       Number(r[6]) || 0,
    createdAt: r[7]
  })).filter(r => r.id !== "");
}

function addTx(tx) {
  const sh = getSheet();
  const id = tx.id || Date.now();
  sh.appendRow([
    id,
    tx.date,
    tx.type,
    tx.src || "",
    tx.detail,
    Number(tx.out) || 0,
    Number(tx.inp) || 0,
    new Date().toISOString()
  ]);
  return { id };
}

function deleteTx(id) {
  const sh = getSheet();
  const data = sh.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(id)) {
      sh.deleteRow(i + 1);
      return { deleted: id };
    }
  }
  return { error: "not found" };
}
