const request = require('sync-request');
const res = request('GET', 'http://pcoding-ru.1gb.ru/txt/labrab04-2.txt');
const text = res.getBody('utf8');
const lines = text.trim().split('\n');

let count = 0;

for (let line of lines) {
  const numbers = line.trim().split(/\s+/).map(Number);
  if (numbers.every(n => n % 2 !== 0)) {
    count++;
  }
}

console.log("Количество строк, где все числа нечётные:", count);
