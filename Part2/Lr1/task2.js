let json = `
    {
        "a": 1,
        "b": { "c": 2, "d": 3 },
        "e": 4,
        "fff": { "v": 10 }
    };`;

const regex = /"(\w+)"\s*:\s*(\{[^{}]*\})/g;

let match;

const values = [];
const names = [];
const pairs = [];

while ((match = regex.exec(json)) !== null) {
    const name = match[1];
    const value = match[2];

    values.push(value);
    names.push(name);
    pairs.push([name, value]);
}

console.log("Значения объектов:");
console.log(values);

console.log("Имена полей:");
console.log(names);

console.log("Пары:");
console.log(pairs);