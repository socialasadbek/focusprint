// Vercel serverless function: sends the order to Telegram.
// Env vars (Vercel -> Settings -> Environment Variables): BOT_TOKEN, CHAT_ID
const esc = (s) => String(s || '-').slice(0, 500).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (d.website) return res.status(200).json({ ok: true }); // honeypot: bots fill this
  const digits = String(d.phone || '').replace(/\D/g, '');
  if (!d.name || !d.service || digits.length < 9 || digits.length > 12) return res.status(400).json({ ok: false });
  const { BOT_TOKEN, CHAT_ID } = process.env;
  if (!BOT_TOKEN || !CHAT_ID) return res.status(500).json({ ok: false });

  const text = [
    '<b>Yangi buyurtma (sayt)</b>',
    'Ism: ' + esc(d.name),
    'Telefon: ' + esc(d.phone),
    'Kompaniya: ' + esc(d.company),
    'Mahsulot: ' + esc(d.service),
    'Miqdor: ' + esc(d.qty),
    'Muddat: ' + esc(d.deadline),
    "Qo'shimcha: " + esc(d.details),
  ].join('\n');

  try {
    const r = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
};
