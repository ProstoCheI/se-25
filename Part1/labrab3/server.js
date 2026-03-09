const express = require('express');
const request = require('sync-request');

const [HOST, PORT] = ['localhost', 5432];
const urls = [
    'http://pcoding-ru.1gb.ru/txt/labrab04-1.txt',
    'http://pcoding-ru.1gb.ru/txt/labrab04-2.txt',
    'http://pcoding-ru.1gb.ru/txt/labrab04-3.txt',
    'http://pcoding-ru.1gb.ru/json/abiturs.json'
];

// Задание 1
function task1() {
    const res = request('GET', urls[0]);
    const text = res.getBody('utf8');
    const numbers = text.split(/\s+/).map(Number);
    const maxTwoDigit = Math.max(...numbers.filter(n => n >= 10 && n <= 99));
    return `Максимальное двузначное число: ${maxTwoDigit}`;
}

// Задание 2
function task2() {
    const res = request('GET', urls[1]);
    const lines = res.getBody('utf8').trim().split('\n');
    let count = 0;
    lines.forEach(line => {
        const nums = line.trim().split(/\s+/).map(Number);
        if (nums.every(n => n % 2 !== 0)) count++;
    });
    return `Количество строк, где все числа нечётные: ${count}`;
}

// Задание 3
function task3() {
    const res = request('GET', urls[1]);
    const lines = res.getBody('utf8').trim().split('\n');
    let maxSum = -Infinity;
    let maxIndex = -1;
    lines.forEach((line, idx) => {
        const nums = line.trim().split(/\s+/).map(Number);
        const sumOdd = nums.filter(n => n % 2 !== 0).reduce((a, b) => a + b, 0);
        if (sumOdd > maxSum) {
            maxSum = sumOdd;
            maxIndex = idx;
        }
    });
    return `Номер строки с максимальной суммой нечётных чисел: ${maxIndex}`;
}

// Задание 4
function task4() {
    const res = request('GET', urls[2]);
    const lines = res.getBody('utf8').trim().split('\n');
    const langs = lines.map(line => line.split(';')[1]);
    langs.sort((a, b) => a.localeCompare(b));
    return 'Список языков в алфавитном порядке:\n' + langs.join('\n');
}

// Задание 5
function task5() {
    const res = request('GET', urls[2]);
    const lines = res.getBody('utf8').trim().split('\n');
    const data = lines.map(line => {
        const [ratingStr, lang] = line.split(';');
        const rating = parseFloat(ratingStr.replace(',', '.').replace('%', ''));
        return { lang, rating };
    });
    data.sort((a, b) => b.rating - a.rating);
    return 'Список языков по убыванию рейтинга:\n' +
        data.map(d => `${d.rating.toFixed(2)}% — ${d.lang}`).join('\n');
}

// Задание 6
function task6() {
    const res = request('GET', urls[3]);
    const abiturs = JSON.parse(res.getBody('utf8'));
    abiturs.sort((a, b) => {
        if (a.city === b.city) return Number(b.rating) - Number(a.rating);
        return a.city.localeCompare(b.city);
    });
    return 'Абитуриенты по городам:\n' +
        abiturs.map(ab => `${ab.city} ${ab.rating} ${ab.lastName}`).join('\n');
}

// Сервер Express
const app = express();
app.use(express.static('public'));

app.get('/:index', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    try {
        const index = parseInt(req.params.index);
        const tasks = [task1, task2, task3, task4, task5, task6];
        if (index < 1 || index > tasks.length) {
            res.status(404).send('Номер задания вне диапазона (1–6)');
            return;
        }
        const result = tasks[index - 1]();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send('Ошибка обработки файла');
    }
});

app.get('/', (req, res) => {
    res.send('Используйте /1, /2, /3, /4, /5 или /6 для просмотра результатов соответствующих заданий.');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://${HOST}:${PORT}/`);
    console.log('Доступные задания:');
    for (let i = 1; i <= 6; i++) {
        console.log(`  http://${HOST}:${PORT}/${i} - Задание ${i}`);
    }
});