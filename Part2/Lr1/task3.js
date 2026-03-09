const fs = require("fs");

const text = fs.readFileSync("task_03.txt", "utf8");

const nums = text.match(/[1-9A-F][0-9A-F]*/g) || [];

const even = nums.filter(n => /[02468ACE]$/.test(n));

const maxLen = Math.max(...even.map(n => n.length));

const longest = even.filter(n => n.length === maxLen);

const max = longest.reduce((a, b) =>
    parseInt(a, 16) > parseInt(b, 16) ? a : b);

console.log("Максимальное число:", max);