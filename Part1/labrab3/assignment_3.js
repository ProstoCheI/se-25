const request = require('sync-request');
const res = request('GET', 'http://pcoding-ru.1gb.ru/txt/labrab04-2.txt');
const text = res.getBody('utf8');
const lines = text.trim().split('\n');

let maxSum = -Infinity;
let maxIndex = -1;

for (let i = 0; i < lines.length; i++) {
  const numbers = lines[i].trim().split(/\s+/).map(Number);
  
  let oddSum = numbers.filter(n => n % 2 !== 0).reduce((a, b) => a + b, 0);

  if (oddSum > maxSum) {
    maxSum = oddSum;
    maxIndex = i;
  }
}

console.log("Индекс строки с максимальной суммой нечётных чисел:", maxIndex);
console.log("Эта сумма =", maxSum);
