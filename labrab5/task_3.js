const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./json/colors.json', 'utf8'));

let names = data.map(item => Object.keys(item)[0]);
let short = names.filter(name => name.length < 6);

short.sort();
console.log(JSON.stringify(short, null, 2));
