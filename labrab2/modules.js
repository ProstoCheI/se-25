const fs = require('fs');
const path = require('path');

function runExperiment(N) {
  const counts = new Array(10).fill(0);
  for (let i = 0; i < N; i++) {
    counts[Math.floor(Math.random() * 10)]++;
  }

  const expected = N / 10;
  const deviations = counts.map(c => Math.abs(c - expected));
  const maxDeviation = Math.max(...deviations);
  const percentDeviation = (maxDeviation / expected * 100).toFixed(2);

  return {
    N,
    percentDeviation
  };
}

function saveResultsToCsv(results, filename = 'data.csv') {
  const dir = path.join(__dirname, 'files');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const filePath = path.join(dir, filename);

  // Заголовки + строки
  let header = "Запусков;Процент отклонения (%)\n";
  let rows = results.map(r =>
    `${r.N};${r.percentDeviation}`
  ).join("\n");

  let csv = header + rows;

  fs.writeFileSync(filePath, csv, 'utf8');
  return filePath;
}

function readDataCsv(filename) {
  return fs.readFileSync(filename, 'utf8')
    .split(/\r?\n/)
    .filter(line => line);
}

module.exports = { runExperiment, saveResultsToCsv, readDataCsv };
