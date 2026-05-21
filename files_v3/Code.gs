// ═══════════════════════════════════════════════════════════
//  Google Apps Script — ร้านขนม API  v3
//  วางไว้ใน Google Sheet → Extensions → Apps Script
//  Deploy → New deployment → Web app
//  Execute as: Me | Who has access: Anyone
//
//  วิธีส่ง request จาก browser:
//  GET  ?action=get
//  GET  ?action=ping
//  GET  ?action=add   &tx_id=...&tx_date=...&tx_type=...&tx_src=...&tx_detail=...&tx_out=...&tx_inp=...
//  GET  ?action=delete&del_id=...
//
//  ส่งแต่ละ field แยก parameter (หลีกเลี่ยงปัญหา JSON decode ภาษาไทย)
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
    [80,110,160,110,280,100,100,160].forEach((w,i) => sh.setColumnWidth(i+1, w));
  }
  return sh;
}

function doGet(e) {
  try {
    const p      = e.parameter;
    const action = p.action || "get";

    let result;
    if (action === "ping") {
      result = { ok: true, time: new Date().toISOString() };

    } else if (action === "get") {
      result = getAllTx();

    } else if (action === "add") {
      // รับแต่ละ field เป็น parameter แยก มีคำนำหน้า tx_
      const tx = {
        id:     p.tx_id     || String(Date.now()),
        date:   p.tx_date   || "",
        type:   p.tx_type   || "",
        src:    p.tx_src    || "",
        detail: p.tx_detail || "",
        out:    Number(p.tx_out) || 0,
        inp:    Number(p.tx_inp) || 0,
      };
      if (!tx.date || !tx.type) throw new Error("tx fields missing (date/type)");
      result = addTx(tx);

    } else if (action === "delete") {
      const id = p.del_id;
      if (!id) throw new Error("del_id missing");
      result = deleteTx(id);

    } else {
      result = { error: "unknown action: " + action };
    }

    return ok(result);
  } catch(err) {
    return fail(err.message);
  }
}

function doPost(e) {
  // fallback เผื่อ browser บางตัวยัง POST ได้
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action || "get";
    let result;
    if      (action === "ping")   result = { ok: true, time: new Date().toISOString() };
    else if (action === "get")    result = getAllTx();
    else if (action === "add")    result = addTx(body.tx);
    else if (action === "delete") result = deleteTx(body.id);
    else result = { error: "unknown" };
    return ok(result);
  } catch(err) {
    return fail(err.message);
  }
}

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function fail(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── CRUD ────────────────────────────────────────────────────

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
  const sh = getSheet();
  sh.appendRow([
    String(tx.id),
    tx.date,
    tx.type,
    tx.src || "",
    tx.detail,
    Number(tx.out) || 0,
    Number(tx.inp) || 0,
    new Date().toISOString()
  ]);
  return { id: String(tx.id) };
}

function deleteTx(id) {
  const sh   = getSheet();
  const data = sh.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(id)) {
      sh.deleteRow(i + 1);
      return { deleted: id };
    }
  }
  return { error: "not found: " + id };
}
