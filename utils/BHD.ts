/**
 * 进制转换
 * @author zeb
 * @created
 */
export default {

  // 二进制转换为十进制
  bindec(val) {
    console.log("bindec--->", val)
  },

  // 十进制转换为二进制
  decbin(val) {
    console.log("decbin--->", val)
  },

  // 十进制转换为八进制
  decoct(val) {
    console.log("decoct--->", val)
  },

  // 十六进制转换为十进制
  hexdec(val) {
    return parseInt(val, 16)
  },

  // 十进制转换为十六进制
  dechex(val) {
    if (typeof (val) === 'string') {
      val = parseInt(val)
    }
    return val.toString(16).padStart(2, '0')
  },

  hexToAscii(hexArray) {
    return hexArray.map(hex => String.fromCharCode(parseInt(hex, 16))).join('').replace(/\s/g, '').toUpperCase();
  },

  hexArrToString(hexArray) {
    return hexArray.map(hexByte => hexByte.toUpperCase()).join(' ');
  }

}
