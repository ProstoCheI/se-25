const fs = require('fs');
const users = JSON.parse(fs.readFileSync('./json/users.json', 'utf8'));

const southUsers = users
  .filter(u => parseFloat(u.address.geo.lat) < 0)
  .map(u => ({
    username: u.username,
    city: u.address.city
  }))
  .sort((a, b) => b.city.localeCompare(a.city));

console.log(JSON.stringify(southUsers, null, 4));
