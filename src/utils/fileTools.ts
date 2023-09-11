/** 主要用于一些常用的文件操作，例如一些格式的下载，文件的格式转换等 **/
import { baseRequest, formatToRequestUrl } from './request'

// word 文档常用 mime
export const docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
export const doc = 'application/msword'

// excel 文档常用 mime
export const csv = 'text/csv'
export const xls = 'application/vnd.ms-excel'
export const xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

// pdf 文档常用 mime
export const pdf = 'application/pdf'

// 图片文档常用 mime
export const png = 'image/png'
export const jpg = 'image/jpeg'
export const gif = 'image/gif'

// 视频文档常用 mime
export const mp4 = 'video/mp4'

export type FileObject = {
  /** 文件名 */
  fileName: string
  /** 文件路径 */
  path: string
  [prop: string]: any
}

// 计算文件大小
export const getSize = (num: number) => {
  if (num < 1024) {
    return num + 'b'
  } else if (num < 1024 * 1024) {
    return (num / 1024).toFixed(2) + 'kb'
  } else if (num < 1024 * 1024 * 1024) {
    return (num / 1024 / 1024).toFixed(2) + 'mb'
  } else if (num < 1024 * 1024 * 1024 * 1024) {
    return (num / 1024 / 1024 / 1024).toFixed(2) + 'gb'
  }
}

// 普通herf下载（不带权限）
export const downloadByHref = (
  url: string,
  params?: ObjectItem | null | undefined,
  name?: string
) => {
  const linkNode = document.createElement('a')
  if (name) linkNode.download = name
  linkNode.href = formatToRequestUrl(url, params || {})
  document.body.appendChild(linkNode)
  linkNode.click()
  document.body.removeChild(linkNode)
}

// 通过某个URL地址下载文件（带权限）
export const downloadFileByUrl = async (
  url: string,
  params: ObjectItem | null | undefined,
  name: string,
  mime: string,
  header: RequestHeader = {}
) => {
  const { data } = await baseRequest(url, params, { ...header, blob: true })
  const objectURL = URL.createObjectURL(new Blob([data], { type: mime }))
  downloadByHref(objectURL, null, name)
  URL.revokeObjectURL(objectURL)
}

// 通过某个URL地址下载图片（不带权限）
export const downloadImgByUrl = async (url: string, name: string) => {
  const image = new Image()
  image.setAttribute('crossOrigin', 'anonymous')
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')
    if (context) {
      context.drawImage(image, 0, 0, image.width, image.height)
      downloadByHref(canvas.toDataURL('image/png'), null, name)
    }
  }
  image.src = url
}

// File文件转base64
export const fileToBase64 = (file: File): Promise<any> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function () {
      resolve(reader.result)
    }
  })
}

// base64转File文件
export const base64ToFile = (data: string, name: string) => {
  const binary = atob(data.split(',')[1])
  const mime = data.split(',')?.[0]?.match(/:(.*?);/)?.[1]
  const array = []
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i))
  }
  const fileData = new Blob([new Uint8Array(array)], {
    type: mime
  })
  const file = new File([fileData], name, {
    type: mime
  })
  return file
}

export const getMimeTypeByBlob = (blob: ArrayBufferLike) => {
  const magicNumbers: ObjectItem = {
    'application/pdf': { data: [0x25, 0x50, 0x44, 0x46], ext: '.pdf' },
    'text/plain': { data: [0x74, 0x65, 0x78, 0x74], ext: '.txt' },
    'video/mp4': {
      data: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d],
      ext: '.mp4'
    },
    'audio/mp3': { data: [0x49, 0x44, 0x33], ext: '.mp3' },
    'image/jpeg': { data: [0xff, 0xd8, 0xff], ext: '.jpg' },
    'image/png': { data: [0x89, 0x50, 0x4e, 0x47], ext: '.png' },
    'image/gif': { data: [0x47, 0x49, 0x46, 0x38], ext: '.gif' },
    'image/bmp': { data: [0x42, 0x4d], ext: '.bmp' },
    'image/webp': { data: [0x52, 0x49, 0x46, 0x46], ext: '.webp' },
    'image/svg+xml': { data: [0x3c, 0x3f, 0x78, 0x6d, 0x6c], ext: '.svg' },
    'image/x-icon': { data: [0x00, 0x00, 0x01, 0x00], ext: '.ico' },
    'application/msword': { data: [0xd0, 0xcf, 0x11, 0xe0], ext: '.doc' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      data: [0x50, 0x4b, 0x03, 0x04],
      ext: '.docx'
    },
    'application/vnd.ms-excel': {
      data: [0xd0, 0xcf, 0x11, 0xe0],
      ext: '.xls'
    },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
      data: [0x50, 0x4b, 0x03, 0x04],
      ext: '.xlsx'
    },
    'application/zip': { data: [0x50, 0x4b, 0x03, 0x04], ext: '.zip' },
    'application/x-rar-compressed': {
      data: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00],
      ext: '.rar'
    },
    'application/vnd.ms-powerpoint': {
      data: [0xd0, 0xcf, 0x11, 0xe0],
      ext: '.ppt'
    },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
      data: [0x50, 0x4b, 0x03, 0x04],
      ext: '.pptx'
    }
  }
  const buffer = new Uint8Array(blob)
  for (const type in magicNumbers) {
    if (magicNumbers.hasOwnProperty(type)) {
      const magicNumber = magicNumbers[type].data
      const matches = magicNumber.every((value: number, index: number) => value === buffer[index])
      if (matches) {
        return { type, ext: magicNumbers[type].ext }
      }
    }
  }
  return { type: 'application/octet-stream', ext: '' }
}

// 通过图片的base64进行压缩
export const compressImgByBase64 = (imgStr: string, maxWidth = 1280): Promise<string> => {
  return new Promise((resolve) => {
    const img = document.createElement('img')
    img.src = imgStr
    img.onload = () => {
      const cav = document.createElement('canvas')
      cav.width = img.width
      cav.height = img.height
      if (img.width > maxWidth) {
        cav.width = maxWidth
        cav.height = img.height / (img.width / maxWidth)
      }
      const ctx = cav.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, cav.width, cav.height)
      }
      resolve(cav.toDataURL('image/jpeg'))
    }
  })
}

// 通过图片的File文件进行压缩
export const compressImgByFile = async (imgFile: File, maxWidth = 1280) => {
  return base64ToFile(
    await compressImgByBase64(await fileToBase64(imgFile), maxWidth),
    imgFile.name.replace(/\..*?$/, '.jpg')
  )
}

// csv数据格式下载
interface ExcelHeader {
  /** header标题 */
  name: string
  /** 对应的字段名 */
  target?: string
  /**
   * 数据转换方法
   * @param item 当前列数据
   * @returns 转换结果
   */
  format?: (item: ObjectItem) => any
}
export const downloadToCsv = (csvHeader: ExcelHeader[], data: ObjectItem[], name: string) => {
  let content = `${csvHeader.map((e) => e.name).join(',')},\n`
  data.forEach((item) => {
    csvHeader.forEach((e) => {
      if (e.format) {
        content += `${e.format(item)},`
      } else if (e.target) {
        content += `${item[e.target]},`
      }
    })
    content += '\n'
  })
  downloadByHref('data:text/csv;charset=utf-8,' + encodeURIComponent(content), null, name)
}
