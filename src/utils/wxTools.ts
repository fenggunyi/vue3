import { SHA1, enc } from 'crypto-js'
import { onActivated } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import wx from 'weixin-js-sdk'
import { request } from './request'
import { generateUUID } from './systemTools'
import api from '@/api'

interface WeixinConfig {
  ticketUrl?: string
  formatTicket?: (result: any) => string
  weixin?: any
  bridgeClose?: () => void
}

let weixinConfig: WeixinConfig = {
  ticketUrl: api.getWxSdkTicket,
  formatTicket: (result) => result,
  weixin: null,
  bridgeClose: () => {}
}

// 设置全局配置
export const setWeixinConfig = (obj: WeixinConfig) => {
  weixinConfig = { ...weixinConfig, ...obj }
}

// 获取微信sdk对象
export const getWeiXinObject = (appId: string, jsApiList: string[] = []) => {
  return new Promise(async (resolve, reject) => {
    let ticket = await request(weixinConfig.ticketUrl!)
    let nonceStr = generateUUID()
    let timestamp = Math.floor(Date.now() / 1000)
    let url = window.location.href.split('#')[0]
    let signature = SHA1(
      'jsapi_ticket=' +
        weixinConfig.formatTicket!(ticket) +
        '&noncestr=' +
        nonceStr +
        '&timestamp=' +
        timestamp +
        '&url=' +
        url
    ).toString(enc.Hex)
    wx.config({
      debug: false,
      appId,
      timestamp,
      nonceStr,
      signature,
      jsApiList // 你需要的JSSDK接口列表
    })
    wx.ready(() => {
      setWeixinConfig({ weixin: wx })
      resolve(wx)
    })
    wx.error(reject)
  })
}

// 关闭当前窗口
export const closeWindow = () => {
  if (window.WeixinJSBridge) {
    window.WeixinJSBridge.call('closeWindow')
  } else {
    window.close()
    weixinConfig.bridgeClose?.()
  }
}

// 拦截返回事件
export const interceptBack = (onBack: () => void) => {
  let timer: any = null
  let pushStateFun: () => void
  let preventBack = () => {
    let route = useRoute()
    let path = '#' + route.fullPath
    pushStateFun = () => {
      let state = {
        title: null,
        url: path
      }
      window.history.pushState(state, '', path)
      clearTimeout(timer)
      timer = setTimeout(() => {
        onBack()
      }, 50)
    }
    let state = {
      title: null,
      url: path
    }
    window.history.pushState(state, '', path)
    window.addEventListener('popstate', pushStateFun, false)
  }

  onActivated(() => {
    preventBack()
  })

  onBeforeRouteLeave((to, from, next) => {
    window.removeEventListener('popstate', pushStateFun, false)
    next()
  })
}
