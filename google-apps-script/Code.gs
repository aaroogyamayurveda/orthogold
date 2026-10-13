const SHEET_NAME = 'Ortho Gold Website Inquiries';
const SHEET_PROPERTY = 'ORTHOGOLD_INQUIRY_SHEET_ID';
const HEADERS = ['Submitted At', 'Name', 'Mobile', 'Source URL'];

/**
 * Run once while signed in as aaroogyamayurveda@gmail.com.
 * Creates the private Google Sheet and prints its URL in the execution log.
 */
function setupInquirySheet() {
  const sheet = getOrCreateSheet_();
  Logger.log('Inquiry spreadsheet: ' + sheet.getParent().getUrl());
  return sheet.getParent().getUrl();
}

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    // Silently accept honeypot submissions without storing them.
    if (String(params.website || '').trim()) {
      return resultPage_(true, 'Thank you.');
    }

    const name = String(params.name || '').trim().slice(0, 100);
    const mobile = String(params.mobile || '').replace(/\\D/g, '');
    const sourceUrl = String(params.sourceUrl || '').slice(0, 1000);

    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      return resultPage_(false, 'कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getOrCreateSheet_();
      sheet.appendRow([new Date(), safeCell_(name), mobile, safeCell_(sourceUrl)]);
    } finally {
      lock.releaseLock();
    }

    return resultPage_(true, 'आपकी inquiry सफलतापूर्वक दर्ज हो गई है।');
  } catch (error) {
    console.error('Inquiry submission failed: ' + error);
    return resultPage_(false, 'अभी inquiry सेव नहीं हो सकी। कृपया WhatsApp से संपर्क करें।');
  }
}

function getOrCreateSheet_() {
  const properties = PropertiesService.getScriptProperties();
  const savedId = properties.getProperty(SHEET_PROPERTY);
  if (savedId) {
    try {
      const existing = SpreadsheetApp.openById(savedId);
      let sheet = existing.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = existing.insertSheet(SHEET_NAME);
      ensureHeaders_(sheet);
      return sheet;
    } catch (error) {
      // The stored sheet may have been deleted or access may have changed.
      properties.deleteProperty(SHEET_PROPERTY);
    }
  }

  const spreadsheet = SpreadsheetApp.create(SHEET_NAME);
  const sheet = spreadsheet.getSheets()[0];
  sheet.setName(SHEET_NAME);
  ensureHeaders_(sheet);
  sheet.setFrozenRows(1);
  sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('C:C').setNumberFormat('@');
  properties.setProperty(SHEET_PROPERTY, spreadsheet.getId());
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('C:C').setNumberFormat('@');
  }
}

function safeCell_(value) {
  const text = String(value || '');
  // Prevent spreadsheet formula injection from user-controlled values.
  return /^[=+@\\-]/.test(text) ? "'" + text : text;
}

function resultPage_(ok, message) {
  const payload = JSON.stringify({
    type: 'orthogold-inquiry-result',
    ok: Boolean(ok),
    message: String(message || '')
  });
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
    '<script>window.parent.postMessage(' + payload + ', "*");</script>' +
    '</body></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
