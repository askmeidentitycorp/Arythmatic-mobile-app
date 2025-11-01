// debug/testPaymentsSummary.js
// Prints Total Value, Successful, Unsuccessful (Failed/Voided) from /payments-nested/

const BASE_URL = 'https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1';
const TOKEN = process.env.API_TOKEN || '';

if (!TOKEN) {
  console.error('Missing API_TOKEN env var. Example (PowerShell): $env:API_TOKEN="{YOUR_TOKEN}"');
  process.exit(1);
}

const absUrl = (u) => (u?.startsWith('http') ? u : `${BASE_URL}${u?.startsWith('/') ? '' : '/'}${u || ''}`);

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${TOKEN}`,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON: ${text.slice(0, 500)}`);
  }
}

function normStatus(s) {
  const v = String(s || '').toLowerCase();
  if (['success', 'successful', 'completed', 'paid'].includes(v)) return 'success';
  if (['failed', 'voided', 'void', 'cancelled', 'canceled'].includes(v)) return 'unsuccessful';
  return 'other';
}

(async () => {
  let url = `${BASE_URL}/payments-nested/?ordering=-created_at&page=1&page_size=100`;
  const byCurrency = {}; // { USD: { total: 0, success: 0, unsuccessful: 0 } }
  let pages = 0, count = 0;

  while (url) {
    pages += 1;
    const data = await fetchPage(url);
    const results = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);

    for (const p of results) {
      const amount = Number.parseFloat(p.amount) || 0;
      const ccy = (p.currency || 'USD').toUpperCase();
      const status = normStatus(p.status);

      byCurrency[ccy] ||= { total: 0, success: 0, unsuccessful: 0 };
      byCurrency[ccy].total += amount;
      if (status === 'success') byCurrency[ccy].success += amount;
      if (status === 'unsuccessful') byCurrency[ccy].unsuccessful += amount;

      count += 1;
    }

    url = data?.next ? absUrl(data.next) : null;
  }

  // Aggregate across currencies (note: mixed currencies; mainly for quick view)
  const agg = Object.entries(byCurrency).reduce((acc, [ccy, v]) => {
    acc.total += v.total;
    acc.success += v.success;
    acc.unsuccessful += v.unsuccessful;
    return acc;
  }, { total: 0, success: 0, unsuccessful: 0 });

  const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  console.log('\nPayments Summary');
  console.log('================');
  console.log(`Records: ${count} across ${pages} page(s)`);
  console.log('\nPer Currency:');
  for (const [ccy, v] of Object.entries(byCurrency)) {
    console.log(`  ${ccy}: Total=${fmt(v.total)} | Successful=${fmt(v.success)} | Unsuccessful=${fmt(v.unsuccessful)}`);
  }
  console.log('\nAggregated (mixed currencies, for quick reference):');
  console.log(`  Total Value = ${fmt(agg.total)}`);
  console.log(`  Successful  = ${fmt(agg.success)}`);
  console.log(`  Unsuccessful= ${fmt(agg.unsuccessful)}`);
})();
