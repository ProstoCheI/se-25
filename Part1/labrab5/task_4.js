const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./json/colors.json', 'utf8'));

let result = data.map(item => {
    const color = Object.keys(item)[0];
    const rgb = item[color].slice(0, 3);
    return { color, rgb };
});

result.sort((a, b) => a.color.localeCompare(b.color));
console.log(result);
