export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false });
  }

  const d = req.body || {};
  const esc = (s) => String(s || '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const text =
    `<b>🆕 Yangi buyurtma</b>\n` +
    `<b>Ism:</b> ${esc(d.name)}\n` +
    `<b>Telefon:</b> ${esc(d.phone)}\n` +
    `<b>Kompaniya:</b> ${esc(d.company)}\n` +
    `<b>Mahsulot:</b> ${esc(d.service)}\n` +
    `<b>Miqdor:</b> ${esc(d.qty)}\n` +
    `<b>Muddat:</b> ${esc(d.deadline)}\n` +
    `<b>Qo'shimcha:</b> ${esc(d.details)}`;

  const r = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    }
  );

  if (!r.ok) {
    return res.status(500).json({ ok: false });
  }
  return res.status(200).json({ ok: true });
}
