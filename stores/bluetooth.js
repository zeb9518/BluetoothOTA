import { defineStore } from 'pinia';
import { ab2hex } from '../utils/BLE/helper.ts'

export const useBluetoothStore = defineStore('bluetooth', {
  state: () => {
    return {
      connected: false,
      device: null,
      // serviceUUID: "0000FFE0-0000-1000-8000-00805F9B34FB",// 蓝牙服务 UUID
      // receiveUUID: "0000FFE1-0000-1000-8000-00805F9B34FB",// 蓝牙读 UUID
      // sendUUID: "0000FFE2-0000-1000-8000-00805F9B34FB",// 蓝牙写 UUID
      serviceUUID: "0000FFF0-0000-1000-8000-00805F9B34FB",// 蓝牙服务 UUID
      receiveUUID: "0000FFF1-0000-1000-8000-00805F9B34FB",// 蓝牙读 UUID
      sendUUID: "0000FFF2-0000-1000-8000-00805F9B34FB"// 蓝牙写 UUID
    };
  },
  actions: {
    // 搜索蓝牙设备
    async startBleDevicesDiscovery(callback) {
      const self = this
      // 初始化蓝牙模块
      await uni.openBluetoothAdapter()
      // 开始搜索设备
      await uni.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: false, // 是否允许重复上报同一设备。如果允许重复上报
        success(res) {
          console.log("startBluetoothDevicesDiscovery====>", res)
        }
      })
      // 监听发现设备
      uni.onBluetoothDeviceFound((devices) => {
        callback(devices)
      })
      return () => {
        self.stopBleDevicesDiscovery();
      }
    },

    async stopBleDevicesDiscovery() {
      await uni.stopBluetoothDevicesDiscovery() // 暂停搜索
      await uni.closeBluetoothAdapter()
    },

    // 连接设备
    connect(device) {
      const deviceId = device.deviceId
      const self = this
      return new Promise(async (resolve, reject) => {
        uni.createBLEConnection({
          deviceId, // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
          success(res) {
            self.connected = true
            self.device = device
            console.log("createBLEConnection", res)
            // 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
            uni.onBLEConnectionStateChange((res) => {
              console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
            })
            console.log("开始获取蓝牙服务", deviceId, self.serviceUUID)
            setTimeout(() => {
              // 获取蓝牙设备所有服务
              uni.getBLEDeviceServices({
                deviceId,
                success(res) {
                  console.log("getBLEDeviceServices----》", res)
                },
                fail(err) {
                  console.log("getBLEDeviceServices---->err:", err)
                }
              })
            }, 1500)

            setTimeout(() => {
              // 获取蓝牙设备某个服务中所有特征值
              uni.getBLEDeviceCharacteristics({
                deviceId,  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                serviceId: self.serviceUUID,  // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
                success(res) {
                  console.log('device getBLEDeviceCharacteristics:', res.characteristics)
                },
                fail(err) {
                  console.log('getBLEDeviceCharacteristics===》err', err)
                }
              })
              resolve(res)
            }, 2000)
          },
          fail(err) {
            reject(err)
          },
          complete() {//无论有没有连上蓝牙，都要停止搜索
            uni.stopBluetoothDevicesDiscovery()
          }
        })
      })
    },


    // 启用低功耗蓝牙设备特征值变化时的 notify 功能,订阅特征值
    notifyBLECharacteristicValueChange(callback) {
      const { device, serviceUUID, receiveUUID } = this
      uni.notifyBLECharacteristicValueChange({
        state: true, // 启用 notify 功能
        deviceId: device.deviceId,// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
        serviceId: serviceUUID,  // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
        characteristicId: receiveUUID, // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
        success(res) {
          console.log('notifyBLECharacteristicValueChange success', res.errMsg)
        }
      })
      // 监听低功耗蓝牙设备的特征值变化事件
      uni.onBLECharacteristicValueChange(function (res) {
        console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
        callback(ab2hex(res.value))
      })
    },

    // 断开连接
    disconnect(deviceId) {
      const self = this
      return new Promise((resolve, reject) => {
        if (!deviceId) {
          reject("设备mac地址为空！")
        } else {
          uni.closeBLEConnection({
            deviceId,
            success: function (res) {
              self.deviceId = null
              self.connected = false
              resolve(res)
            },
            fail: function (err) {
              exception.dispose(err);
              reject(err)
            }
          })
        }
      })
    },


    /**
     * 写数据
     * 对应 writeWithResponse
     * @method
     * @param {hexstring} value hexstring 16进制字符串
     *      resolve： 返回当前对象，value为成功写入的value
     *      reject：100:设备正在连接中  102:服务或者特征值未发现
     */
    write(hexValue) {
      const { device, serviceUUID, sendUUID } = this
      console.log("write====>", device.deviceId, hexValue, serviceUUID, sendUUID)
      return new Promise((resolve, reject) => {
        uni.writeBLECharacteristicValue({
          deviceId: device.deviceId,  // 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
          serviceId: serviceUUID, // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
          characteristicId: sendUUID, // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
          value: hexValue, // 这里的value是ArrayBuffer类型
          success: (res) => {
            console.log('writeBLECharacteristicValue success', res.errMsg);
            resolve(res);
          },
          fail: (err) => {
            console.log("writeBLECharacteristicValue fail", err)
            reject(err);
          }
        })
      })
    },

    /**
     * 读数据
     */
    read() {
      const deviceId = this.device.deviceId
      return new Promise((resolve, reject) => {
        uni.readBLECharacteristicValue({
          deviceId,  // 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
          serviceId: this.serviceUUID, // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
          characteristicId: this.sendUUID, // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
          success: (res) => {
            resolve(res);
          },
          fail: (err) => {
            reject(err);
          }
        })
      })
    }
  },
});
