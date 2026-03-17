const user = "Иванов Иван Иванович";

const result1 = user.replace(/^(\S+)\s(\S+)\s(\S+)$/, "$2 $1");
console.log(result1);

const result2 = user.replace(/^(?<last>\S+)\s(?<first>\S+)\s(?<middle>\S+)$/, "$<first> $<last>");
console.log(result2);