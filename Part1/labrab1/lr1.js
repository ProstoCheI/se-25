function getRandom() {
  return Math.floor(Math.random() * 10);
}

const sampleSizes = [10 ** 2, 10 ** 4, 10 ** 6, 10 ** 8];

for (let size of sampleSizes) {
  let frequencies = {};

  for (let i = 0; i < size; i++) {
    let value = getRandom();
    frequencies[value] = (frequencies[value] || 0) + 1;
  }

  let deviations = {};

  for (let digit = 0; digit <= 9; digit++) {
    let percent = (frequencies[digit] / size) * 100;
    let delta = (percent - 100 / 10).toFixed(4);
    deviations[digit] = `${delta}%`;
  }

  console.log(`\nРазмер выборки: ${size}`);
  console.log('Отклонения по цифрам:', deviations);
  console.log('-'.repeat(40));
}
