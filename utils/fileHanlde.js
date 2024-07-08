function sliceFile(file, len) {
  // 原始数据包
  let dataPacket = new Array();
  // 初始化数据缓冲区
  let sector = new Array();

  // 分包
  file.forEach((item, index) => {
    if (index !== 0 && index % len === 0) {
      dataPacket.push(sector);
      sector = []; // 清空暂存区
    }
    sector.push(item);
  });
  // 补齐 如果最后一包数据小于128个字节，以0xff补齐
  while (true) {
    if (sector.length === 0) {
      break;
    }
    if (sector.length === len) {
      dataPacket.push(sector);
      sector = []; // 清空暂存区
      break;
    }
    sector.push(0x00); // 补0
  }
  return
}