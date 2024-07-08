<template>
  <view class="content">
    <view class="head-title action flex justify-between align-center">
      <view>
        <text class="cuIcon-titles text-blue"></text>
        <text class=" text-xl">设备列表（{{ deviceList.length }}）</text>
      </view>
      <view class="padding-tb">
        <image src="../static/refresh.png" style="width: 55rpx; height: 55rpx;"
          :class="{ 'rotate-animation': isRefresh }" @click="handleRefresh()">
        </image>
      </view>
    </view>
    <scroll-view class="device-scroll-view" scroll-y>
      <view class="card article flex justify-between" v-for="(item, index) in deviceList" :key="index">
        <view class="card-item">
          <image class="icon" src="../../static/bluetooth.png" mode=""></image>
          <view class="device-info">
            <text class="text-bold">{{ item.name || item.localName || "N/A" }}</text>
            <text>{{ item.deviceId }}</text>
            <text class="text-cut">{{ item.RSSI }} dBm</text>
          </view>
        </view>
        <view class="card-item">
          <button class="cu-btn round bg-blue" @click="handleConnect(item)">连接</button>
        </view>
      </view>
      <view class="flex align-center justify-center padding-top " v-if="deviceList.length === 0">
        <image src="../static/SvgSpinners180Ring.svg" style="width: 40rpx; height: 40rpx;"></image>
        <text class="margin-left-sm">正在搜索设备... </text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onReady, onShow } from '@dcloudio/uni-app'
import { useBluetoothStore } from '@/stores/bluetooth'

const bluetoothStore = useBluetoothStore();
// 是否刷新
const isRefresh = ref(false)

const deviceList = ref([])

onReady(() => {
  handleStartDiscovery()
})

onShow(() => {
  handleRefresh()
})


// 处理设备连接
function handleConnect(device) {
  uni.showLoading({ title: '连接中...', mask: true });
  bluetoothStore.connect(device).then(res => {
    uni.showToast({ title: '连接成功', duration: 2000 });
    uni.navigateTo({
      url: '/pages/upgrade',
    })
  }).catch(err => {
    console.log("连接失败=====>", err)
    uni.showToast({ title: '连接失败', icon: "error", duration: 2000 });
  }).finally(() => {
    uni.hideLoading();
  })
}

// 开始搜索
function handleStartDiscovery() {
  deviceList.value = []
  bluetoothStore.startBleDevicesDiscovery((res) => {
    if (res.devices) {
      const filterDevices = res.devices.filter(item => item.name && (item.name.includes('PD') || item.name.includes('BT')))
      const preDeviceList = deviceList.value
      filterDevices.forEach(device => {
        const deviceIndex = preDeviceList.findIndex(item => item.deviceId === device.deviceId)
        if (deviceIndex > -1) {
          preDeviceList[deviceIndex] = device
        } else {
          preDeviceList.push(device)
        }
      });
      deviceList.value = preDeviceList
    }
  })
}


// 重新扫描设备
async function handleRefresh() {
  if (!isRefresh.value) {
    await bluetoothStore.stopBleDevicesDiscovery()
    handleStartDiscovery();
  }
  isRefresh.value = true
  // 2000ms后关闭刷新
  setTimeout(() => {
    isRefresh.value = false
  }, 2000)
}


</script>

<style>
.card {
  padding: 30rpx;
  background-color: white;
  border-bottom: 1px solid #9c9c9c
}

.card-item {
  display: flex;
  align-items: center;
}

.icon {
  width: 40rpx;
  height: 50rpx;
}

.head-title {
  height: 100rpx;
  display: flex;
  align-items: center;
}

.device-scroll-view {
  height: calc(100vh - 100rpx)
}

.device-info {
  display: flex;
  flex-direction: column;
  margin-left: 30rpx;
}

.action {
  padding: 20rpx;
}


@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.rotate-animation {
  animation: rotate 2000ms linear infinite;
}
</style>