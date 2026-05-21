// ═══════════════════════════════════════════════════════════
//  Google Apps Script — ร้านขนม API
//  วางไว้ใน Google Sheet → Extensions → Apps Script
//  Deploy → New deployment → Web app
//  Execute as: Me | Who has access: Anyone
//
//  ⚠️ ทุก request ส่งเป็น GET parameter (หลีกเลี่ยง CORS POST issue)
//  payload ที่ยาวจะ encode เป็น base64 ใน parameter "d"
// ═══════════════════════════════════════════════════════════

const SHEET_NAME = "transactions";
const HEADERS    = ["id","date","type","src","detail","out","inp","createdAt"];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    const hRow = sh.getRange(1, 1, 1, HEADERS.length);
    hRow.setValues([HEADERS]);
    hRow.setBackground("#1a1a2e").setFontColor("#ffffff").setFontWeight("bold");
    sh.setFrozenRows(1);
    [80,110,160,110,280,100,100,160].forEach((w,i)=>sh.setColumnWidth(i+1,w));
  }
  return sh;
}

// Apps Script ส่ง doGet เสมอ (browser redirect POST → GET)
function doGet(e) {
  const action = e.parameter.action || "get";

  // payload ส่งมาใน parameter "d" เป็น JSON string (encodeURIComponent)
  let payload = {};
  if (e.parameter.d) {
    try { payload = JSON.parse(decodeURIComponent(e.parameter.d)); } catch(_) {}
  }

  let result;
  try {
    if      (action === "ping")   result = { ok: true, time: new Date().toISOString() };
    else if (action === "get")    result = getAllTx();
    else if (action === "add")    result = addTx(payload.tx);
    else if (action === "delete") result = deleteTx(payload.id);
    else                          result = { error: "unknown action: " + action };

    return ok(result);
  } catch(err) {
    return fail(err.message);
  }
}

function doPost(e) {
  // fallback — parse postData ถ้ามี
  let action = "get", payload = {};
  try {
    const body = JSON.parse(e.postData.contents);
    action  = body.action  || action;
    payload = body;
  } catch(_) {}

  let result;
  try {
    if      (action === "ping")   result = { ok: true, time: new Date().toISOString() };
    else if (action === "get")    result = getAllTx();
    else if (action === "add")    result = addTx(payload.tx);
    else if (action === "delete") result = deleteTx(payload.id);
    else                          result = { error: "unknown action" };
    return ok(result);
  } catch(err) {
    return fail(err.message);
  }
}

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function fail(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAllTx() {
  const rows = getSheet().getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1)
    .filter(r => r[0] !== "")
    .map(r => ({
      id:        String(r[0]),
      date:      r[1],
      type:      r[2],
      src:       r[3],
      detail:    r[4],
      out:       Number(r[5]) || 0,
      inp:       Number(r[6]) || 0,
      createdAt: r[7]
    }));
}

function addTx(tx) {
  if (!tx) throw new Error("tx payload missing");
  const sh = getSheet();
  const id = String(tx.id || Date.now());
  sh.appendRow([
    id, tx.date, tx.type, tx.src||"", tx.detail,
    Number(tx.out)||0, Number(tx.inp)||0,
    new Date().toISOString()
  ]);
  return { id };
}

function deleteTx(id) {
  if (!id) throw new Error("id missing");
  const sh   = getSheet();
  const data = sh.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(id)) {
      sh.deleteRow(i + 1);
      return { deleted: id };
    }
  }
  return { error: "not found" };
}
