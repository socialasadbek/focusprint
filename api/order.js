// Vercel serverless function: sends the order to Telegram (personal chat + group).
// Env vars: BOT_TOKEN, CHAT_ID, GROUP_CHAT_ID
const esc = (s) => String(s || '-').slice(0, 500).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  let d = {};
  try {
    d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch (e) {
    return res.status(400).json({ ok: false });
  }
  if (d.website) return res.status(200).json({ ok: true }); // honeypot
  const digits = String(d.phone || '').replace(/\D/g, '');
  if (!d.name || !d.service || digits.length < 9 || digits.length > 12) return res.status(400).json({ ok: false });

  const { BOT_TOKEN, CHAT_ID, GROUP_CHAT_ID } = process.env;
  const targets = [CHAT_ID, GROUP_CHAT_ID].filter(Boolean);
  if (!BOT_TOKEN || !targets.length) return res.status(500).json({ ok: false });

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

  const send = (chat_id) =>
    fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' }),
    }).then((r) => r.ok);

  const results = await Promise.allSettled(targets.map(send));
  const okCount = results.filter((x) => x.status === 'fulfilled' && x.value).length;
  return res.status(okCount ? 200 : 502).json({ ok: okCount > 0 });
};
