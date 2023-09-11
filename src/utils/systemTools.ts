import { MD5 } from 'crypto-js'
import Cookies from 'js-cookie'
import { baseRequest, request } from './request'
import api from '@/api'
import { getMimeTypeByBlob } from './fileTools'

// 将十六进制转rgb
const hexToRgb = (hex: string): [number, number, number, number] | null => {
  if (hex.length == 4) {
    hex = hex.replace(/(\w)(\w)(\w)/gi, '$1$1$2$2$3$3')
  }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255]
    : null
}

// 从色带中获取特定位置色值
const getColor = (
  startColorRgb: [number, number, number, number],
  endColorRgb: [number, number, number, number],
  step: number
) => {
  const startColor = startColorRgb
  const endColor = endColorRgb
  const sR = startColor[0]
  const sG = startColor[1]
  const sB = startColor[2]
  const eR = endColor[0]
  const eG = endColor[1]
  const eB = endColor[2]
  return `rgba(${[
    Math.round(sR + (eR - sR) * step),
    Math.round(sG + (eG - sG) * step),
    Math.round(sB + (eB - sB) * step),
    1
  ].join(',')})`
}

export const save = (key: string, data?: any) => {
  if (!key) return
  if (data) {
    let str = JSON.stringify(data)
    localStorage.setItem(key, str)
  } else {
    localStorage.removeItem(key)
  }
}

export const load = (key: string) => {
  if (!key) return
  try {
    let str: string | null = localStorage.getItem(key)
    return str ? JSON.parse(str) : null
  } catch (e) {
    return null
  }
}

export const getCookies = (key: string, isObj = true) => {
  let str = Cookies.get(key)
  if (str) {
    let val = Cookies.get(key)
    try {
      return val ? (isObj ? JSON.parse(val) : val) : null
    } catch (e) {
      return null
    }
  } else {
    return null
  }
}

export const setCookies = (key: string, data?: any, isObj = true) => {
  if (isObj) {
    if (data) {
      Cookies.set(key, JSON.stringify(data))
    } else {
      Cookies.remove(key)
    }
  } else {
    Cookies.set(key, data)
  }
}

export const isPromise = (obj: any) => {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  )
}

export const getObjValue = (obj: any, path: string) => {
  return path
    .split(/[[\].]/)
    .filter(Boolean)
    .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj)
}

export const getValueByObjOrFunction = async (obj: any): Promise<any> => {
  if (isPromise(obj)) {
    return await obj
  } else if (typeof obj === 'function') {
    const data = obj()
    if (isPromise(data)) {
      return await data
    }
  }
  return obj
}

/**
 * 函数节流
 * @param func 要执行的函数
 * @param wait 等待时间，单位为毫秒
 * @param immediate 是否为立即执行函数（即前置节流），默认为 false
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait = 500,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<T>) => {
    if (immediate && !timer) {
      func(...args)
      timer = setTimeout(() => {
        timer = undefined
      }, wait)
      return
    }
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
      timer = undefined
    }, wait)
  }
}

// 将文本复制到剪切板
export const copyToClipBoard = (val: string) => {
  let textarea = document.createElement('textarea')
  document.body.appendChild(textarea)
  textarea.value = val
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

// 获取当前数值在渐变色中的位置颜色 colorLine = [['#fff',0],['#f00',50],['#0f0',100]]
export const getColorByColorLine = (colorLine: [string, number][], num: number) => {
  if (num <= colorLine[0][1]) return hexToRgb(colorLine[0][0])
  if (num >= colorLine[colorLine.length - 1][1]) return hexToRgb(colorLine[colorLine.length - 1][0])
  for (let i = 1; i < colorLine.length; i++) {
    if (num == colorLine[i][1]) return hexToRgb(colorLine[i][0])
    if (num < colorLine[i][1]) {
      let startColorRgb = hexToRgb(colorLine[i - 1][0])
      let endColorRgb = hexToRgb(colorLine[i][0])
      return (
        startColorRgb &&
        endColorRgb &&
        getColor(
          startColorRgb,
          endColorRgb,
          (num - colorLine[i - 1][1]) / (colorLine[i][1] - colorLine[i - 1][1])
        )
      )
    }
  }
}

// 根据字符串生成颜色
export const getColorByText = (str: string) => {
  let num = 0
  MD5(str).words.forEach((val) => (num += val))
  return `hsl(${num}, 100%, 40%)`
}

// 生成UUID
export const generateUUID = () => {
  return (
    new Date().getTime().toString(16) +
    Math.floor(1e7 * Math.random()).toString(16) +
    ((Math.random() * 0x100000000) | 0).toString(16).substring(1) +
    ((Math.random() * 0x100000000) | 0).toString(16).substring(1) +
    ((Math.random() * 0x100000000) | 0).toString(16).substring(1) +
    ((Math.random() * 0x100000000) | 0).toString(16).substring(1)
  )
}

// 根据接口返回的数据生成Blob:Url
export const getBlobUrl = async (url: string, params: ObjectItem = {}, mime?: string) => {
  try {
    const { data } = await baseRequest(url, params, { blob: true })
    if (mime) {
      return URL.createObjectURL(new Blob([data], { type: mime }))
    } else {
      return URL.createObjectURL(data)
    }
  } catch (e) {
    console.warn(`getBlobUrl:${url} -> 请求错误`)
    return ''
  }
}

export const getBase64Url = async (url: string, params: ObjectItem = {}, mime?: string) => {
  try {
    const { data } = await baseRequest(url, params, { blob: true })
    let buffer = await data.arrayBuffer()
    let base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    if (mime) {
      return `data:${mime};base64,${base64}`
    } else {
      return `data:${data.type};base64,${base64}`
    }
  } catch (e) {
    console.warn(`getBlobUrl:${url} -> 请求错误`)
    return ''
  }
}

// 根据字典名获取字典数据
let dictCache: ObjectItem = {}

export const getDictByName = async (dictName: string, rowKey = 'id'): Promise<LabelValue[]> => {
  if (dictCache[dictName]) {
    return dictCache[dictName]
  } else {
    let result: any = await request(api.dictUrl, {
      codes: dictName
    })
    dictCache[dictName] = result[dictName].map((e: any) => {
      return {
        label: e.label,
        value: e[rowKey],
        item: e
      }
    })
    return dictCache[dictName]
  }
}

export const getDictByNameList = async (dicts: string[], rowKey = 'id'): Promise<DictObj> => {
  let needRequestDicts: string[] = []
  let dictObj: DictObj = {}
  for (let i = 0; i < dicts.length; i++) {
    if (dictCache[dicts[i]]) {
      dictObj[dicts[i]] = dictCache[dicts[i]]
    } else {
      needRequestDicts.push(dicts[i])
    }
  }
  if (needRequestDicts.length == 0) return dictObj
  let result: any = await request(api.dictUrl, {
    codes: needRequestDicts.join(',')
  })
  needRequestDicts.forEach((key) => {
    dictCache[key] = dictObj[key] = result[key].map((e: any) => {
      return {
        label: e.label,
        value: e[rowKey],
        item: e
      }
    })
  })
  return dictObj
}
