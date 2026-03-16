const fs = require('fs');

const rows = fs.readFileSync('sem_02_labrab_01.csv', 'utf8').trim().split('\n');

for (let i = 0; i < rows.length; i++) {
  const nums = rows[i].split(/\s+/).map(Number);
  const counts = new Map();

  for (const num of nums) {
    counts.set(num, (counts.get(num) || 0) + 1);
  }

  const repeated = [];
  const unique = [];
  let validCounts = true;

  for (const [num, count] of counts.entries()) {
    if (count === 2) {
      repeated.push(num);
    } else if (count === 1) {
      unique.push(num);
    } else {
      validCounts = false;
      break;
    }
  }

  if (!validCounts) continue;
  if (repeated.length !== 2) continue;

  const repeatedSum = repeated.reduce((sum, num) => sum + num * 2, 0);
  const uniqueSum = unique.reduce((sum, num) => sum + num, 0);

  if (repeatedSum < uniqueSum) {
    console.log(`${i + 1}: ${nums.join(' ')}`);
  }
}
