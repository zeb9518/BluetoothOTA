function* outputValues(arr) {
  for (let i = 0; i < arr.length; i++) {
    yield { item: arr[i], index: i };
  }
}

// 示例用法
const arr = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
const valueOutput = outputValues(arr);

// 手动触发 Generator 函数
let result = valueOutput.next();
console.log(result)
// while (!result.done) {
//   console.log(result.value);
//   result = valueOutput.next();
// }
// const buff = ["41", "35", "30", "31", "45", "46"]
// // 转换函数
// function hexToAscii(hexArray) {
//   return hexArray.map(hex => String.fromCharCode(parseInt(hex, 16))).join('').replace(/\s/g, '').toUpperCase();
// }
// console.log(hexToAscii(buff))
// const hexArray = ["a5", "02", "ef"];
// const hexString = hexArray.map(hexByte => hexByte.toUpperCase()).join(' ');
// console.log(hexString === "");
