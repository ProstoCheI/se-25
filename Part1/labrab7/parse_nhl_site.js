const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

async function fetchHtml(url) {
  const res = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      Referer: 'https://www.nhl.com/',
    },
  });
  return res.data;
}

function normalizeText(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function tableToJson($, table) {
  const headers = [];

  $(table)
    .find('thead tr th')
    .each((i, th) => {
      headers.push(normalizeText($(th).text()));
    });

  if (headers.length === 0) {
    $(table)
      .find('tr')
      .first()
      .find('th, td')
      .each((i, cell) => {
        headers.push(normalizeText($(cell).text()));
      });
  }

  const rows = [];
  $(table)
    .find('tbody tr, table tr:not(:first-child)')
    .each((ri, tr) => {
      const cells = $(tr).find('td');
      if (cells.length === 0 || $(tr).hasClass('header-row')) return;

      const obj = {};
      cells.each((ci, td) => {
        const h = headers[ci] || `col${ci}`;
        obj[h] = normalizeText($(td).text());

        const link = $(td).find('a').attr('href');
        if (link && link.includes('/team/')) {
          obj['Team_Link'] = `https://www.nhl.com${link}`;
        }
      });

      const hasData = Object.values(obj).some((val) => val && val.length > 0);
      if (hasData) {
        rows.push(obj);
      }
    });

  return { headers, rows };
}

async function parseNHLStandings(url) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const preferredNHLHeaders = [
    'Team',
    'GP',
    'W',
    'L',
    'OTL',
    'PTS',
    'ROW',
    'GF',
    'GA',
    'DIFF',
    'HOME',
    'AWAY',
    'S/O',
    'L10',
    'STRK',
  ];
  const preferredPlayerHeaders = [
    'Player',
    'Team',
    'Pos',
    'GP',
    'G',
    'A',
    'PTS',
    '+/-',
    'PIM',
    'PPG',
    'PPA',
    'SHG',
    'SHA',
    'GWG',
    'OTG',
    'Shots',
    'Shot%',
  ];

  let best = null;
  let bestScore = -1;

  $('table').each((i, table) => {
    const { headers, rows } = tableToJson($, table);

    if (!headers || headers.length < 3 || rows.length === 0) return;

    let score = 0;
    headers.forEach((h) => {
      const headerLower = h.toLowerCase();
      if (
        preferredNHLHeaders.some((ph) =>
          headerLower.includes(ph.toLowerCase())
        ) ||
        preferredPlayerHeaders.some((ph) =>
          headerLower.includes(ph.toLowerCase())
        )
      ) {
        score++;
      }
    });

    const metric = score * 1000 + rows.length;
    if (metric > bestScore) {
      bestScore = metric;
      best = { headers, rows };
    }
  });

  if (!best) {
    $('table').each((i, table) => {
      const { headers, rows } = tableToJson($, table);
      if (headers.length >= 3 && rows.length > 5) {
        best = { headers, rows };
        return false;
      }
    });
  }

  if (!best) {
    const firstTable = $('table').first();
    if (firstTable.length) {
      best = tableToJson($, firstTable);
    }
  }

  if (best && best.rows.length === 0) {
    console.warn('Таблица найдена, но строк с данными не обнаружено');
    const allRows = [];
    $('table tr').each((ri, tr) => {
      const cells = $(tr).find('td');
      if (cells.length > 2) {
        const row = {};
        cells.each((ci, td) => {
          row[`col${ci}`] = normalizeText($(td).text());
        });
        allRows.push(row);
      }
    });

    if (allRows.length > 0) {
      best.rows = allRows;
      best.headers = Object.keys(allRows[0]).map(
        (k) => `Column ${k.replace('col', '')}`
      );
    }
  }

  return best || { headers: [], rows: [] };
}

function toCsv(headers, rows) {
  if (headers.length === 0 || rows.length === 0) {
    return '';
  }

  const hdr = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
  const lines = [hdr];
  for (const r of rows) {
    const line = headers
      .map((h) => {
        const v = r[h] ?? '';
        return `"${String(v).replace(/"/g, '""')}"`;
      })
      .join(',');
    lines.push(line);
  }
  return lines.join('\n');
}

async function main(argv) {
  const args = require('minimist')(argv.slice(2));

  const defaultUrl =
    'https://www.championat.com/hockey/_nhl/tournament/6606/table/';
  const url = args.url || defaultUrl;
  const out = args.out || 'nhl_standings';
  const noWrite = args['no-write'] || args['no_write'] || false;

  try {
    console.log('Загружаю NHL данные с:', url);
    const { headers, rows } = await parseNHLStandings(url);

    if (headers.length === 0 || rows.length === 0) {
      console.error('Не удалось найти таблицу с данными на странице');
      console.log('Попробуйте другой URL или проверьте структуру страницы');
      return;
    }

    console.log(
      `Найдена таблица с ${headers.length} столбцами и ${rows.length} строками`
    );
    console.log('Заголовки:', headers);

    const csv = toCsv(headers, rows);
    const json = JSON.stringify(rows, null, 2);

    const lab7Dir = path.resolve(__dirname);
    const csvPath = path.join(lab7Dir, `${out}.csv`);
    const jsonPath = path.join(lab7Dir, `${out}.json`);

    if (!noWrite) {
      fs.mkdirSync(lab7Dir, { recursive: true });
      fs.writeFileSync(csvPath, csv, 'utf8');
      fs.writeFileSync(jsonPath, json, 'utf8');
      console.log(`Файлы сохранены: ${csvPath} и ${jsonPath}`);
    } else {
      console.log('Режим без записи. Превью первых 5 строк:');
      console.log(JSON.stringify(rows.slice(0, 5), null, 2));
      console.log(
        `\n(Если бы скрипт записывал, файлы были бы: ${csvPath} и ${jsonPath})`
      );
    }

    return { headers, rows };
  } catch (err) {
    console.error('Ошибка:', err.message);
    if (err.response) {
      console.error('Статус:', err.response.status);
      console.error('URL:', err.response.config.url);
    }
    throw err;
  }
}

if (require.main === module) {
  main(process.argv).catch(() => process.exit(1));
}
