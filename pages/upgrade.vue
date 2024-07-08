<template>
  <scroll-view class="container" scroll-y="false">
    <view>
      <view class="device-container">
        <view class="title padding-sm">
          <text class="cuIcon-titles text-blue"></text>
          <text class=" text-xl">设备信息</text>
        </view>
        <view class="flex align-center padding-sm">
          <image src="../static/bluetooth.png" class="icon"></image>
          <view class="flex flex-direction margin-left">
            <text class="text-bold">设备名：{{ device?.name || device?.localName || "N/A" }}</text>
            <text class="text-bold">设备ID：{{ device?.deviceId || "N/A" }}</text>
            <text class="text-bold">当前版本号：{{ version || "--" }}</text>
          </view>
        </view>
      </view>
      <view>
        <view class="title padding-sm">
          <text class="cuIcon-titles text-blue"></text>
          <text class=" text-xl">BIN文件信息</text>
        </view>
        <view class="flex flex-direction padding-sm">
          <text class="text-bold">文件名：{{ originalFile?.name || "--" }}</text>
          <text class="text-bold">上传时间：{{ dayjs(originalFile?.lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") || "--"
            }}</text>
        </view>
      </view>
      <view>
        <view class="title padding-sm">
          <text class="cuIcon-titles text-blue"></text>
          <text class=" text-xl">进度</text>
        </view>
        <view class="padding-sm">
          <view class="cu-progress radius striped active round">
            <view class="bg-blue" :style="[{ width: true ? upgradeProgress : '' }]">{{ upgradeProgress }}</view>
          </view>
        </view>
      </view>
      <view class="log-container">
        <view class="title padding-sm">
          <text class="cuIcon-titles text-blue"></text>
          <text class="text-xl" ref="logsRef">日志</text>
        </view>
        <view class="padding bg-white">
          <Logs :logs="logs" />
        </view>
      </view>
    </view>
	  </scroll-view>
    <view class="foot-container padding">
	  <button class="cu-btn round bg-blue lg margin-bottom-xs" @click="getDeviceVersion()" :disabled="startOTA">获取版本号</button>
      <button class="cu-btn round bg-blue lg" @click="startUpgrade()" :disabled="startOTA">开始OTA</button>
    </view>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onReady, onUnload } from '@dcloudio/uni-app'
import { useBluetoothStore } from '@/stores/bluetooth'
import { hexToAb } from '../utils/BLE/helper'
import BHD from '../utils/BHD'
import dayjs from 'dayjs'
import Logs from '../components/logs'

const bluetoothStore = useBluetoothStore();
const { device } = bluetoothStore
const version = ref("")
const logs = ref("") // 日志
const CHUNK_SIZE = 64

const upgradeFileSize = ref(0)  // 升级文件大小
const upgradeFileComplete = ref(0)  // 已完成数量
const startOTA = ref(false)

const originalFile = ref(null) // 源文件
const originalArray = ref(null) // 源文件数组

let genChunk = null
let valueOutput = null

const upgradeProgress = computed(() => {
  const percentage = (upgradeFileComplete.value / upgradeFileSize.value) * 100 || 0
  return percentage !== 0 ? `${parseInt(percentage)}%` : ""
})

onReady(() => {
  openNotifyBLECharacteristicValueChange();
  downloadUpgradeFile();
})

onMounted(() => {
    getDeviceVersion()  // 获取版本号
})

let timer;
function startTimer() {
  timer = setTimeout(() => {
	addLogs("=====> OTA超时 <=====");
	uni.showModal({
		title: '提示',
		content: 'OTA超时!!!',
		showCancel:false
	});
	startOTA.value = false;
	valueOutput = null;
	genChunk = null;
  }, 300000); // 300000 毫秒等于 5 分钟
}

// 下载升级文件
function downloadUpgradeFile() {
  uni.downloadFile({
    url: 'https://yuexing.zebblog.com/downloads/OTA_File.bin', //仅为示例，并非真实的资源
    success: (res) => {
      if (res.statusCode === 200) {
        readFileArrayBuffer(res.tempFilePath).then(res => {
          originalArray.value = new Uint8Array(res)
        })
      }
    }
  });
}

// ArrayBuffer切片
function splitUint8Array(array, chunkSize) {
  let result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(new Uint8Array(array.slice(i, i + chunkSize)));
  }
  result = result.map((item, index) => {
    const dataLength = item.length
    const checkSum = item.reduce((a, b) => a + b, 0)
    const chunk = new Uint8Array(dataLength + 3)
    chunk[0] = 0x5A
    chunk[1] = dataLength
    chunk.set(item, 2)
    chunk[dataLength + 2] = checkSum
    return chunk
  })
  return result;
}


// 读取文件转换为ArrayBuffer  
const readFileArrayBuffer = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      plus.io.resolveLocalFileSystemURL(
        filePath,
        function (entry) {
          entry.file(function (file) {
            const fileReader = new plus.io.FileReader()
            fileReader.readAsDataURL(file)
            originalFile.value = file
            fileReader.onloadend = function (evt) {
              const result = {
                base64: evt.target.result.split(',')[1],
                size: file.size,
              }
              resolve(uni.base64ToArrayBuffer(result.base64))
            }
          })

        },
        function (error) {
          reject(error)
        },
      )
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 开始升级
 */
function startUpgrade() {
  if (originalArray.value) {
    addLogs("=====> 开始准备Bluetooth OTA <=====")
    const chunks = splitUint8Array(originalArray.value, CHUNK_SIZE);
    upgradeFileSize.value = chunks.length
    upgradeFileComplete.value = 0
    addLogs(`已处理完成OTA文件共计：${chunks.length}个分包。`)
    setTimeout(() => {
      bluetoothStore.write(hexToAb(["A5", "01", "EF"])) // 进入BootLoader
    }, 300)
    valueOutput = outputGenValues(chunks)
    startOTA.value = true
	startTimer()
  } else {
    addLogs("=====> Error OTA 失败找不到源文件 <=====")
  }
}

// 定义常量
const START_DATA_FRAME = ["A5", "10", "0C", "00", "EF"];
const END_DATA_FRAME = ["5A", "00", "00"];
const EXIT_BOOTLOADER = ["A5", "FF", "EF"];
const RESPONSE_A = "A501FE"; // 进入BootLoader
const RESPONSE_B = "A511FE"; // 发送数据
const RESPONSE_C = "A502FE"; // 数据接收成功
const RESPONSE_D = "A5FFFE"; // 退出BootLoader
const RESPONSE_E = "A544FE"; // 升级失败

/**
 * 开启特征值变化
 */
const openNotifyBLECharacteristicValueChange = () => {
  let isEnd = false;
  // 发送数据块
  const sendChunk = () => {
    const genChunk = valueOutput.next(); // 获取下一包
    if (!genChunk.done) {
      upgradeFileComplete.value = genChunk.value?.index;
      bluetoothStore.write(genChunk.value.item.buffer);
      addLogs(`发送第${genChunk.value.index}包数据`);
    } else {
      isEnd = true;
      bluetoothStore.write(hexToAb(END_DATA_FRAME));
      addLogs("结束数据帧的发送");
    }
  };
  bluetoothStore.notifyBLECharacteristicValueChange((res) => {
    console.log("notifyBLECharacteristicValueChange====>", res, BHD.hexToAscii(res));
    if (res[0] === "55" && res[1] === "aa" && res[2] === "ee" && res.length > 8) {
      const hexString = BHD.hexArrToString(res)
      addLogs(`收到设备应答：${hexString}`);
      version.value = hexString
    }
    const hexAsscii = BHD.hexToAscii(res);
    if (valueOutput) {
      addLogs(`收到设备应答：${hexAsscii}`);
      if (compareStrings(hexAsscii, RESPONSE_A)) {
        addLogs("开始数据帧的发送");
        bluetoothStore.write(hexToAb(START_DATA_FRAME)); // 开始数据帧的发送
      }
      if (compareStrings(hexAsscii, RESPONSE_B)) { // 开始发送数据
        sendChunk(); // 发送第一包
      }
      if (compareStrings(hexAsscii, RESPONSE_C)) {
        if (isEnd) {
          addLogs("退出BootLoader");
          bluetoothStore.write(hexToAb(EXIT_BOOTLOADER)); // 退出BootLoader 
        } else {
          sendChunk(); // 发送下一包
        }
      }
      if (compareStrings(hexAsscii, RESPONSE_D)) {
		clearTimeout(timer);
		uni.showModal({
			title: '提示',
			content: '固件升级成功',
			showCancel:false
		});
        addLogs("=====> 结束Bluetooth OTA <=====");
        startOTA.value = false;
        valueOutput = null;
        genChunk = null;
        getDeviceVersion() // 获取版本号
      }
      if (compareStrings(hexAsscii, RESPONSE_E)) {
        bluetoothStore.write(hexToAb(END_DATA_FRAME));
        addLogs("=====> OTA失败 <=====");
		clearTimeout(timer);
		uni.showModal({
			title: '提示',
			content: 'OTA失败!!!',
			showCancel:false
		});
      }
    }
  });
};


// 字符串对比函数
const compareStrings = (a, b) => {
  return String(a).toUpperCase() === String(b).toUpperCase();
}


// 获取版本
const getDeviceVersion = () => {
  addLogs("=====> 获取设备版本号 <=====")
  setTimeout(() => {
	bluetoothStore.write(hexToAb(["55", "AA", "DE", "00", "00", "00", "00", "21", "0D", "0A"]))
  },1000)
}


function* outputGenValues(arr) {
  for (let i = 0; i < arr.length; i++) {
    yield { item: arr[i], index: i + 1 };
  }
}


// 添加日志
const addLogs = (text) => {
  logs.value += `${dayjs().format('HH:mm:ss')}：${text}\n`
}


// 页面卸载
onUnload(() => {
  if (originalFile.value) {
    uni.removeSavedFile({ filePath: originalFile.value.fullPath })
  }
  bluetoothStore.disconnect(device?.deviceId)
})

</script>

<style>
.container {
  height: 100%;
  width: 100%;
  padding-bottom: 260rpx;
  position: relative;
  overflow: hidden;
}

.title {
  padding: 30rpx
}

.icon {
  width: 60rpx;
  height: 80rpx;
}

.cu-btn {
  width: 100%;
}


.foot-container {
  position: fixed;
  width: 100%;
  bottom: 0;
  padding-bottom: 60rpx;
}
</style>