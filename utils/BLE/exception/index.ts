import CODE_ENUM from './code'

/**
 * 异常处理
 */
export const CODE = CODE_ENUM;

export default {
  dispose(error) {
    switch (error.errCode) {
      case CODE.ALREADY_CONNECT:
        return '设备已连接，请稍后再试试吧'
      case CODE.NOT_INIT:
        return '未初始化蓝牙适配器'
      case CODE.NOT_AVAILABLE:
        return '请检查手机蓝牙是否打开'
      case CODE.NO_DEVICE:
        return '没有找到指定设备'
      case CODE.CONNECTION_FAIL:
        return '设备连接失败'
      case CODE.NO_SERVICE:
        return '没有找到指定服务'
      case CODE.NO_CHARACTERISTIC:
        return '没有找到指定特征值'
      case CODE.NO_CONNECTION:
        return '当前连接已断开'
      case CODE.PROPERTY_NOT_SUPPORT:
      case CODE.SYSTEM_ERROR:
      case CODE.INVALID_DATA:
        return '设备启动失败，请重试'
      case CODE.SYSTEM_NOT_SUPPORT:
        return '当前系统版本过低，请更新版本体验'
      case CODE.OPERATE_TIME_OUT:
        return '连接超时'
    }
  }
}
