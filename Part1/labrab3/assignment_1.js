const request = require('sync-request')

const get_numbers_from_url = (url) => {
    let data = request("GET", url).getBody("utf8")
    return data.split(/\s+/).map(Number).filter(n => !isNaN(n))
}

let url = "http://pcoding-ru.1gb.ru/txt/labrab04-1.txt"
let numbers = get_numbers_from_url(url)

let twoDigit = numbers.filter(n => n >= 10 && n <= 99)
let maxTwoDigit = Math.max(...twoDigit)

console.log('Самое большое двузначное число:', maxTwoDigit)
