const TG_TOKEN  = '8934540200:AAEItoAjLwrphgOLR7aA2w8hy2kGZQgmTxU';  // ⬅️ ضع هنا توكن البوت من BotFather
const TG_CHAT   = '6340739523';    // ⬅️ ضع هنا معرف الشات (أو group id)

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'الاسم', 'الهاتف', 'الولاية', 'البلدية', 'العنوان',
        'الملاحظات', 'المنتج', 'اللون', 'المقاس', 'السعر',
        'الكمية', 'نوع التوصيل', 'التاريخ'
      ]);
    }

    const p = e.parameter;

    sheet.appendRow([
      p.name || '', p.phone || '', p.wilaya || '', p.commune || '',
      p.address || '', p.notes || '', p.product || '', p.color || '',
      p.size || '', p.price || p.total_price || '',
      p.quantity || p.bundle_qty || '',
      p.delivery_type || p.type_livraison || '',
      new Date().toLocaleString('ar-DZ', { timeZone: 'Africa/Algiers' })
    ]);

    sendTelegram(p);

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendTelegram(p) {
  const deliveryTxt = p.delivery_type === 'stopdesk' ? 'للمكتب (Stop Desk)' : 'للمنزل';
  const msg = `🛍️ طلب جديد
━━━━━━━━━━━━━━
👤 ${p.name || '—'}
📞 ${p.phone || '—'}
📍 ${p.wilaya || ''} / ${p.commune || ''}
🏠 ${p.address || '—'}
━━━━━━━━━━━━━━
🎨 ${p.color || '—'} · 📐 ${p.size || '—'}
📦 ${p.bundle_label || ''} × ${p.quantity || p.bundle_qty || '1'}
💰 ${p.price || p.total_price || ''} دج
🚚 ${deliveryTxt}
${p.notes ? '📝 '+p.notes : ''}
⏰ ${new Date().toLocaleString('ar-DZ', { timeZone: 'Africa/Algiers' })}`;

  try {
    const res = UrlFetchApp.fetch(
      `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({ chat_id: TG_CHAT, text: msg }),
        muteHttpExceptions: true
      }
    );
    console.log('✅ Telegram response: ' + res.getContentText());
  } catch (err) {
    console.log('❌ Telegram error: ' + err.toString());
  }
}

function testTelegram() {
  const testData = {
    name: 'اختبار', phone: '0555123456', wilaya: 'الجزائر',
    commune: 'باب الوادي', address: 'اختبار عنوان',
    product: 'بيجامة نسائية', color: 'وردي', size: 'M',
    bundle_label: 'قطعتان', quantity: '2', price: '5400',
    delivery_type: 'home', notes: 'هذا اختبار'
  };
  sendTelegram(testData);
  console.log('✅ تم تشغيل اختبار تلجرام — تفقد السجلات (View > Logs)');
}

function doGet() {
  return ContentService.createTextOutput('✅ GAS is running')
    .setMimeType(ContentService.MimeType.TEXT);
}
