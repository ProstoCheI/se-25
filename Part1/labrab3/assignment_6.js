const request = require('sync-request');

let res = request('GET', 'http://pcoding-ru.1gb.ru/json/abiturs.json');
let data = JSON.parse(res.getBody('utf8'));

data.sort((a, b) => {
  if (a.city === b.city) {
    return b.rating - a.rating; 
  }
  return a.city.localeCompare(b.city); 
});

for (let abitur of data) {
  console.log(abitur.city, abitur.rating, abitur.lastName);
}
