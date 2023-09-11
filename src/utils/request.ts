import { showFailToast } from 'vant'
import axios from 'axios'
import { getCookies, setCookies } from './systemTools'

axios.defaults.timeout = 60000
axios.interceptors.request.use((config) => {
  // 此处对请求的header进行配置
  let cookies = getCookies('token')
  if (cookies) {
    config.headers = Object.assign(getHeaders(cookies), config.headers)
  }
  return config
})
axios.interceptors.response.use(
  (response: any) => {
    if (response.data?.code == 10) {
      setCookies('token', null)
      location.reload()
    } else {
      return response
    }
  },
  (error) => {
    if (error.request.status === 401) {
      setCookies('token', null)
      location.reload()
    } else {
      return { data: JSON.parse(error.request.response) }
    }
  }
)

/**
 * 获取请求头
 * @param cookies 用户的cookies，包含token
 * @returns
 */
export const getHeaders = (Token = getCookies('token')) => {
  return {
    Token
  }
}

/**
 * 拼接query请求地址
 * @param url 请求地址
 * @param data 请求体
 * @returns 拼接后的地址
 */
export const formatToRequestUrl = (url: string, data: ObjectItem) => {
  let param = url.replace('blob:', '').match(/:[a-zA-Z]+/g)
  if (param) {
    param.forEach((ele) => {
      let attr = ele.substring(1)
      url = url.replace(ele, data[attr])
      delete data[attr]
    })
  }
  Object.keys(data).forEach((ele) => {
    if (data[ele] === null || data[ele] === undefined || data[ele] === '') {
      delete data[ele]
    }
  })
  let params = Object.keys(data).map((k) => {
    return `${k}=${data[k]}`
  })
  return `${url}${params.length ? `?${params.join('&')}` : ``}`
}

/**
 * 基础接口请求，返回axios请求结果对象
 * @param url 请求地址
 * @param data 请求体
 * @param header 请求头
 * @returns 请求结果
 */
export const baseRequest = (
  url: string,
  data?: ObjectItem | FormData | null | undefined,
  { body, query, headers, blob }: RequestHeader = {}
) => {
  let params: ObjectItem = {}
  if (data) params = data
  // 替换参
  let param = url.match(/:[a-zA-Z]+/g)
  if (param) {
    param.forEach((ele) => {
      let attr = ele.substring(1)
      url = url.replace(ele, params[attr])
      delete params[attr]
    })
  }
  let method: any = url.match(/^(PUT|DELETE|GET|POST|JSONP|FORM)\s/)
  if (method) {
    url = url.replace(method[0], '')
    method = method[0].trim()
  } else {
    method = 'GET'
  }
  if (method == 'GET') {
    Object.keys(params).forEach((ele) => {
      if (params[ele] === null || params[ele] === undefined || params[ele] === '') {
        delete params[ele]
      }
    })
  }
  method = method.toLowerCase()
  url = import.meta.env.VITE_BASE_URL + url
  switch (method) {
    case 'post':
      if (data instanceof FormData) {
        return axios.post(url, data, {
          params: query,
          headers,
          responseType: blob ? 'blob' : 'json'
        })
      } else {
        return axios.post(
          url,
          Array.isArray(body)
            ? body
            : {
                ...data,
                ...body
              },
          {
            params: query,
            headers,
            responseType: blob ? 'blob' : 'json'
          }
        )
      }
    default:
      return axios.get(url, {
        params: Object.assign(data || {}, query || {}),
        headers,
        responseType: blob ? 'blob' : 'json'
      })
  }
}

/**
 * 接口请求，自动取出结果返回
 * @param url 请求地址
 * @param data 请求体
 * @param header 请求头
 * @returns 请求结果
 */
export const request = (
  url: string,
  data?: ObjectItem | FormData | null | undefined,
  header: RequestHeader = {}
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        data: { code, data: result, msg }
      } = await baseRequest(url, data, header)
      if (code === 200) {
        resolve(result)
      } else if (code === 300) {
        showFailToast(msg)
        resolve(result)
      } else if (code === 403) {
        showFailToast('登录已失效，请重新登录')
        setCookies('token', null)
        setTimeout(() => {
          location.reload()
        }, 1000)
      } else if (!header.log) {
        showFailToast(msg)
        reject()
      }
    } catch (e) {
      console.log(e)
      if (header.log !== false) showFailToast('请求数据接口失败')
      reject(e)
    }
  })
}
