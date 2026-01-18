const express = require('express');
const { HOST, PORT } = { HOST: 'localhost', PORT: 3000 };
const app = express();

app.use(express.static('css'));
app.use(express.urlencoded({ extended: true }));

const head = `
<head>
    <meta charset="UTF-8">
    <title>Конвертер чисел</title>
    <link rel="stylesheet" href="/style.css" />
</head>`;

const formConverter = `
<form method="POST" action="/">
    <input type="text" name="inputNumber" required placeholder="Введите число" /><br>
    <input type="number" name="base" min="2" max="16" required placeholder="Основание системы" /><br>
    <button type="submit">Перевести</button>    
</form>`;

const getHtml = (result = '') => `
<!DOCTYPE html>
<html lang="ru">
    ${head}
    <body>
        <h1>Конвертер чисел</h1>
        ${formConverter}
        <br>
        <div id="output">${result}</div>
    </body>
</html>`;

app.post('/', (req, res) => {
    const num = parseInt(req.body.inputNumber);
    const base = parseInt(req.body.base);

    if (Number.isNaN(num) || Number.isNaN(base) || base < 2 || base > 16) {
        res.send(getHtml("Некорректные данные"));
    } else {
        const result = num.toString(base).toUpperCase();
        res.send(getHtml(`${num}(10) => ${result}(${base})`));
    }
});

app.get('/', (req, res) => {
    res.send(getHtml());
});

app.listen(PORT, HOST, () => console.log(`Сервер запущен: http://${HOST}:${PORT}/`));