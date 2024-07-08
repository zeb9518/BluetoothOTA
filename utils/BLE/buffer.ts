export default {
  buffer_uint8(value) {
    const uint8Array = new Uint8Array(1);
    const dv = new DataView(uint8Array.buffer, 0);
    dv.setUint8(0, value);
    return [].slice.call(uint8Array);
  },
  buffer_int8(value) {
    const uint8Array = new Uint8Array(1);
    const dv = new DataView(uint8Array.buffer, 0);
    dv.setInt8(0, value);
    return [].slice.call(uint8Array);
  },
  buffer_int16(value, littleEndian) {
    const uint8Array = new Uint8Array(2);
    const dv = new DataView(uint8Array.buffer, 0);
    dv.setInt16(0, value, littleEndian);
    return [].slice.call(uint8Array);
  },
  buffer_uint16(value, littleEndian) {
    const uint8Array = new Uint8Array(2);
    const dv = new DataView(uint8Array.buffer, 0);
    dv.setUint16(0, value, littleEndian);
    return [].slice.call(uint8Array);
  },
  buffer_uint32(value, littleEndian) {
    const uint8Array = new Uint8Array(4);
    const dv = new DataView(uint8Array.buffer, 0);
    dv.setUint32(0, value, littleEndian);
    return [].slice.call(uint8Array);
  },
  buffer_int32(value, littleEndian) {
    const uint8Array = new Uint8Array(4);
    const dv = new DataView(uint8Array.buffer, 0);
    dv.setInt32(0, value, littleEndian);
    return [].slice.call(uint8Array);
  },
  buffer_int64(value) {
    //Number.MAX_SAFE_INTEGER
    const local_MAX_UINT32 = 0xFFFFFFFF;
    const big = ~~(value / local_MAX_UINT32);
    const low = (value % local_MAX_UINT32) - big;
    const uint8Array = new Uint8Array(8);
    const dv = new DataView(uint8Array.buffer, 0);
    dv.setInt32(0, big);
    dv.setInt32(4, low);
    return [].slice.call(uint8Array);
  },
  buffer_uint64(value) {
    //Number.MAX_SAFE_INTEGER
    const local_MAX_UINT32 = 0xFFFFFFFF;
    const big = ~~(value / local_MAX_UINT32);
    const low = (value % local_MAX_UINT32) - big;
    const uint8Array = new Uint8Array(8);
    const dv = new DataView(uint8Array.buffer, 0);
    dv.setUint32(0, big);
    dv.setUint32(4, low);
    return [].slice.call(uint8Array);
  },
  buffer_float(value, littleEndian) {
    const uint8Array = new Uint8Array(4);
    const dv = new DataView(uint8Array.buffer, 0);
    dv.setFloat32(0, value, littleEndian);
    return [].slice.call(uint8Array);
  },
  buffer_double(value, littleEndian) {
    const uint8Array = new Uint8Array(8);
    const dv = new DataView(uint8Array.buffer, 0);
    dv.setFloat64(0, value, littleEndian);
    return [].slice.call(uint8Array);
  },
  buffer_string(value) {
    const string = unescape(encodeURIComponent(value));
    const charList = string.split("");
    const uint8Array: any = new Array();
    for (let i = 0; i < charList.length; i++) {
      uint8Array.push(charList[i].charCodeAt(0));
    }
    const byteLength = uint8Array.length;
    return [].concat(this.buffer_int16(byteLength), uint8Array);
  }
}
