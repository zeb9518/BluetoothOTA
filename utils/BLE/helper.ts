import Buffer from './buffer'

/**
 * 蓝牙工具函数
 */
export function checkCrc8(datagramStart, datagramEnd, dataList) {
  dataList = dataList || [];
  let buffer = datagramStart;// 包头
  let start_pos = 0;
  let hexA = new Array();
  for (let i = start_pos; i < (dataList.length / 2); i++) {
    let s = dataList.substr(start_pos, 2);
    let v = parseInt(s, 16)
    hexA.push(v);
    start_pos += 2
  }
  for (let i = 0; i < hexA.length; i++) {
    buffer = buffer.concat(Buffer.buffer_int8(hexA[i]))
  }
  let checkNum = checkSum(buffer);// 校验
  buffer.push(...datagramEnd)// 包尾
  buffer = buffer.map(byte => {// 检查数据是否需要补零
    return parseInt(byte).toString(16).padStart(2, '0');
  })
  buffer.splice(buffer.length - 1, 0, checkNum); //插入校验
  console.info('发送数据:', buffer)
  return buffer.join('');
}

// 校验和
export function checkSum(buffer: [number]) {
  let checksum = 0x00;
  for (let i = 0; i < buffer.length; i++) {
    checksum += buffer[i]
  }
  return (checksum & 0xFF).toString(16).padStart(2, '0')
}


export function hexToAb(hex) {
  let hexArray;
  if (typeof hex === 'string') {
    hexArray = hex.match(/[\da-f]{2}/gi);
  } else if (Array.isArray(hex)) {
    hexArray = hex;
  } else {
    throw new Error('Invalid input. Input must be a string or an array.');
  }
  const typedArray = new Uint8Array(hexArray.map(h => parseInt(h, 16)));
  return typedArray.buffer;
}

export function array2String(buffer) {
  let hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return `${hexArr[7]}:${hexArr[6]}:${hexArr[5]}:${hexArr[2]}:${hexArr[1]}:${hexArr[0]}`
}

// ArrayBuffer转16进制字符串示例
export function ab2hex(buffer) {
  let hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
    return ('00' + bit.toString(16)).slice(-2)
  })
  return hexArr.join(',').split(',')
}
