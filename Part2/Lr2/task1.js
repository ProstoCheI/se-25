const fs = require('fs');

const rows = fs.readFileSync('sem_02_labrab_01.csv', 'utf8').trim().split('\n');
const answer = [];

for (let i = 0; i < rows.length; i++) {
  const nums = rows[i].split(/\s+/).map(Number);

  const allOdd = nums.every((num) => num % 2 === 1);
  const isUnique = new Set(nums).size === 6;

  let isAscending = true;
  for (let j = 1; j < nums.length; j++) {
    if (nums[j] <= nums[j - 1]) {
      isAscending = false;
      break;
    }
  }

  if (allOdd && isUnique && isAscending) {
    answer.push(i + 1);
  }
}

console.log(answer.join(' '));
