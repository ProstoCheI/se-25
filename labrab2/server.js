const http = require('http');
const fs = require('fs');
const path = require('path');

// подключаем модуль
const { readDataCsv, runExperiment, saveResultsToCsv } = require('./modules.js');

const [ HOST, PORT ] = [ 'localhost', 3000 ];

const onEvent = (req, res) => {
    let params = req.url.split('/');
    let filename = params.at(-1);

    if (filename === 'favicon.ico') {
        res.writeHead(204);
        return res.end();
    }

    if (!filename) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Ошибка: не указано имя файла');
        return;
    }

    // ==== Особый случай: запускаем эксперимент и возвращаем CSV ====
    if (filename === 'data.csv') {
        const results = [10**2, 10**4, 10**6, 10**8, 10**10].map(runExperiment);
        const filePath = saveResultsToCsv(results);
        const csvContent = fs.readFileSync(filePath, 'utf8');

        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(csvContent);
        return;
    }

    // ==== Обычный случай: читаем CSV из папки files ====
    let filepath = path.join(__dirname, 'files', filename);
    if (!fs.existsSync(filepath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Ошибка 404: файл не найден');
        return;
    }

    try {
        const data = readDataCsv(filepath);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write(data.map(num => String(num)).join('<br>'));
        res.write('<br> = = = = = =');
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Ошибка сервера: ' + err.message);
        return;
    }

    res.end();
};

const server = http.createServer(onEvent);
server.listen(PORT, () => console.log(`http://${HOST}:${PORT}/`));
