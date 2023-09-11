export default {
  getAutoApiById: '/api/server/getApiConfig/:id',
  // 字典管理
  dictUrl: '/api/dict/getDictByCode',
  // 开放接口
  getWxSdkTicket: '/api/openApi/getWxSdkTicket',
  login: 'POST /api/openApi/login',
  getOpenId: '/api/openApi/getOpenId',
  loginByOpenId: 'POST /api/openApi/loginByOpenId',
  // 文件管理
  downloadUrl: '/api/file/download/:id',
  uploadUrl: 'POST /api/file/upload',
  // 用户管理
  getUserInfo: '/api/user/getUserInfo',
  getUserOpenId: '/api/user/getUserOpenId',
  // 通用接口
}
