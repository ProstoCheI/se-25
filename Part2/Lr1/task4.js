const fs = require("fs");

const text = fs.readFileSync("weather.html", "utf8");

function getWeatherWeek(html) {
    const regex = /<div class="table-row-day dayline">[\s\S]*?<div class="dayweek_(?:date|weekend)">(\d{2}\s+[а-я]+)<\/div>[\s\S]*?<div class="dayweek_week">(Пн|Вт|Ср|Чт|Пт|Сб|Вс)<\/div>[\s\S]*?<div class="sunrise_set"[^>]*>\s*Восход:\s*(\d{2}:\d{2})<br\/?>\s*Закат:\s*(\d{2}:\d{2})/gi;

    const result = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
        result.push({
            date: match[1],
            day: match[2],
            sunrise: match[3],
            sunset: match[4]
        });
    }

    return result;
}

const weather = getWeatherWeek(text);

weather.forEach(item => {
    console.log(`${item.date} ${item.day}  Восход: ${item.sunrise}  Закат: ${item.sunset}`);
});