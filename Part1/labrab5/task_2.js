const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./json/clients.json', 'utf8'));
const clients = data.clients;

let result = clients.filter(client => client.address.city === 'Кунгур');

result.sort((a, b) => {
    if (a.gender !== b.gender) {
        if (a.gender === 'female') return -1;
        else return 1;
    }

    if (a.age !== b.age) return b.age - a.age;
    return a.name.localeCompare(b.name, 'ru');
});

console.log(JSON.stringify(result, null, 4));
