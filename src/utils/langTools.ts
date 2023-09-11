import { deepMap } from './dataTools'
import { getObjValue } from './systemTools'

let langDicts: ObjectItem = {}

const formatText = (
  str?: string,
  textTransform: 'capitalize' | 'uppercase' | 'lowercase' | 'none' = 'none'
) => {
  return str || ''
}

export const setLanguage = (dicts: ObjectItem) => {
  langDicts = dicts
}

export const $t = (
  str?: string,
  replaceObj: ObjectItem = {},
  textTransform: 'capitalize' | 'uppercase' | 'lowercase' | 'none' = 'none'
) => {
  if (typeof str === 'string' && str) {
    let result = langDicts[str] || str
    if (result) {
      result = result.replace(/tag.*?:/, '')
    }
    Object.keys(replaceObj).forEach((key) => {
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), $t(replaceObj[key]))
    })
    return formatText(result, textTransform)
  } else {
    return str || ''
  }
}

export const translateList = (
  list: ObjectItem[],
  translateKeys: string[],
  textTransform: 'capitalize' | 'uppercase' | 'lowercase' | 'none' = 'none'
) => {
  if (Array.isArray(list)) {
    return deepMap(list, (item: ObjectItem) => {
      let obj = { ...item }
      translateKeys.forEach((key) => {
        let val = getObjValue(obj, key)
        if (typeof val === 'string' && val) {
          obj[key] = formatText($t(val), textTransform)
        }
      })
      return obj
    })
  } else {
    return list
  }
}

export const getCurrentLanguage = (defaultLang = 'zh-CN') => {
  return localStorage.getItem('lang') || navigator.language || defaultLang
}

export const $j = (...val: string[]) => {
  let lang = getCurrentLanguage().toLowerCase()
  if (lang.match(/zh\b/)) {
    return val.join('')
  } else {
    return val.join(' ')
  }
}

export const getValueByLang = (obj: ObjectItem, defaultValue?: any) => {
  let lang = getCurrentLanguage().toLowerCase()
  let dicts: ObjectItem = {}
  Object.keys(obj).forEach((key) => {
    dicts[key.toLowerCase()] = obj[key]
  })
  return dicts[lang] ?? defaultValue
}
