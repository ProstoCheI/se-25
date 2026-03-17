const request = require('sync-request');

let res = request('GET', 'http://pcoding-ru.1gb.ru/txt/labrab04-3.txt');
let text = res.getBody('utf8').trim().split('\n');
let arr = [];

for (let line of text) {
  let parts = line.split(';');
  let p = parseFloat(parts[0].replace(',', '.').replace('%', ''));
  let l = parts[1].trim();
  arr.push([p, l]);
}

arr.sort((a, b) => b[0] - a[0]);

for (let item of arr) {
  console.log(item[0].toFixed(2), item[1]);
}
