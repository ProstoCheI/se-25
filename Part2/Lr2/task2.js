const fs = require('fs');

const rows = fs.readFileSync('sem_02_labrab_01.csv', 'utf8').trim().split('\n');

rows.forEach((row, index) => {
  const nums = row.split(/\s+/).map(Number);
  const freq = {};

  for (const num of nums) {
    freq[num] = (freq[num] || 0) + 1;
  }

  let repeatedNumber = null;
  let tripleCount = 0;

  for (const key in freq) {
    if (freq[key] === 3) {
      repeatedNumber = Number(key);
      tripleCount++;
    }
  }

  if (tripleCount !== 1) return;

  const others = nums.filter((num) => num !== repeatedNumber);
  if (new Set(others).size !== others.length) return;

  const sumOthers = others.reduce((sum, num) => sum + num, 0);
  const avgOthers = sumOthers / others.length;

  if (repeatedNumber > avgOthers) {
    console.log(`${index + 1}: ${nums.join(' ')}`);
  }
});
