const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const headers = { 'User-Agent': 'Mozilla/5.0', accept: '*/*' };

async function getProducts(page, opts = {}) {
  const url = `https://search.wb.ru/exactmatch/ru/common/v5/search?query=планшет&sort=price_desc&page=${page}&resultset=catalog&appType=1&curr=rub&dest=-1257786`;
  const maxAttempts = Number(opts.maxRetries ?? 5);
  let attempt = 0;
  let backoff = Number(opts.backoffMs ?? 1500);

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const res = await axios.get(url, { headers, timeout: 15000 });
      const data = res.data;
      if (page === 1) console.log('Всего найдено (метаданные):', data.metadata?.total || 'неизвестно');
      return data.data?.products || [];
    } catch (err) {
      const status = err.response && err.response.status;
      console.log(`Попытка ${attempt} не удалась (код ${status || 'N/A'}):`, err.message);

      if (status === 429 && err.response && err.response.headers) {
        const ra = err.response.headers['retry-after'];
        if (ra) {
          const raSec = parseInt(ra, 10);
          if (!Number.isNaN(raSec)) {
            const waitMs = raSec * 1000 + Math.floor(Math.random() * 500);
            console.log(`Сервер просит ждать (Retry-After) ${raSec}s — жду ${Math.round(waitMs/1000)}s`);
            await sleep(waitMs);
            continue;
          }
        }
      }

      if (attempt >= maxAttempts) {
        console.log('Достигнут предел попыток для страницы', page);
        return [];
      }

      const jitter = Math.floor(Math.random() * (backoff / 2));
      const wait = backoff + jitter;
      console.log(`Жду ${Math.round(wait/1000)}s перед повторной попыткой`);
      await sleep(wait);
      backoff *= 2;
    }
  }
  return [];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const args = require('minimist')(process.argv.slice(2));
  const pages = Number(args.pages || args.p) || 3;
  const outName = args.out || 'products';
  const maxRetries = Number(args['max-retries'] || args.r) || 5;
  const backoffMs = Number(args['delay'] || args.d) || 1500;
  const outDir = path.join(__dirname);
  const outPath = path.join(outDir, `${outName}.json`);

  console.log('Сбор данных, страниц:', pages);
  let all = [];
  console.log(`Параметры: maxRetries=${maxRetries}, initialBackoffMs=${backoffMs}`);
  for (let i = 1; i <= pages; i++) {
    console.log('Загружаю страницу', i);
    const products = await getProducts(i, { maxRetries, backoffMs });
    console.log('Товаров на странице:', products.length);
    all = all.concat(products);
    await sleep(3000);
  }

  console.log('Всего собрано товаров:', all.length);

  const result = all.map(p => ({
    id: p.id,
    brand: p.brand,
    name: p.name,
    feedbacks: p.feedbacks,
    supplierRating: p.supplierRating,
    link: `https://www.wildberries.ru/catalog/${p.id}/detail.aspx`,
    price: (p.sizes?.[0]?.price?.product || 0) / 100,
    basePrice: (p.sizes?.[0]?.price?.basic || 0) / 100,
    color: p.colors?.[0]?.name || null,
    category: p.subjectName || null,
    totalQuantity: p.totalQuantity || null
  }));

  try {
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(result, null, 2), 'utf8');
    console.log('Файл сохранён:', outPath);
  } catch (e) {
    console.log('Ошибка при записи файла:', e.message);
  }
}

if (require.main === module) main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });

module.exports = { getProducts };
