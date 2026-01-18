const data = require('./json/data.js');

const len = Math.min((data.colors || []).length, (data.argb || []).length);
const hexColors = [];
for (let i = 0; i < len; i++) {
    const color = data.colors[i];
    const rgbArr = (data.argb[i] && data.argb[i].slice(0,3)) || [0,0,0];
    const hex_name = '#' + rgbArr.map(n => Number(n).toString(16).padStart(2,'0')).join('').toUpperCase();
    hexColors.push({ color, hex_name });
}

hexColors.sort((a, b) => a.color.localeCompare(b.color));
console.log(JSON.stringify(hexColors, null, 4));
