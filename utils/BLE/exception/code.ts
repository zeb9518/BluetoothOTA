/**
 * 错误代码
 */
enum CODE_ENUM {
  OK = 0,  // 正常
  ALREADY_CONNECT = -1, //	已连接
  NOT_INIT = 10000, // 未初始化蓝牙适配器
  NOT_AVAILABLE = 10001, // 当前蓝牙适配器不可用
  NO_DEVICE = 10002, // 没有找到指定设备
  CONNECTION_FAIL = 10003, // 连接失败
  NO_SERVICE = 10004, // 没有找到指定服务
  NO_CHARACTERISTIC = 10005, // 没有找到指定特征
  NO_CONNECTION = 10006, // 当前连接已断开
  PROPERTY_NOT_SUPPORT = 10007, // 当前特征不支持此操作
  SYSTEM_ERROR = 10008, // 其余所有系统上报的异常
  SYSTEM_NOT_SUPPORT = 10009, // Android 系统特有，系统版本低于 4.3 不支持 BLE
  OPERATE_TIME_OUT = 10012, // 连接超时
  INVALID_DATA = 10013, // 连接 deviceId 为空或者是格式不正确
}

export default CODE_ENUM;
