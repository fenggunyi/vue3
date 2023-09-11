import './JCardViewer.less'

import { $t, getBlobUrl, getMimeTypeByBlob } from 'utils'
import { Image as VanImage } from 'vant'
import { defineComponent, reactive, ref, watchEffect } from 'vue'
import JFileViewer from './JFileViewer'
import JIcon from './JIcon'
import api from '@/api'

interface FileProps {
  path: string
  fileId?: string
  fileName?: string
  mimeTypeType?: string
  mimeTypeExt?: string
  mimeTypeIcon?: string
}

export type JCardViewerProps = {
  /** 展示尺寸 */
  size?: number
  /** 是否展示下载按钮 */
  showDownload?: boolean
  /** 是否展示名称 */
  showName?: boolean
  /** 后端预览或下载地址 */
  downloadUrl?: string
  /** 空提示 */
  emptyText?: string
  /** 文件地址数组 */
  src: string[] | FileProps[]
  /** 是否启用鉴权模式 */
  useToken?: boolean
  /** 禁止显示下一个按钮 */
  showNextBtn?: boolean
  /** 自定义预览渲染 */
  customPreviewRender?: (
    file: FileProps
  ) => void | string | number | JSX.Element | MyArray<string | number | JSX.Element>
  /** 预览 */
  onPreview?: (file: FileProps) => true | void
}

export default defineComponent({
  name: 'JCardViewer',
  props: {
    size: {
      type: Number,
      default: 64
    },
    showDownload: Boolean,
    showName: {
      type: Boolean,
      default: true
    },
    downloadUrl: {
      type: String,
      default: () => api.downloadUrl
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    src: {
      type: Array as () => string[] | FileProps[],
      default: () => [],
      required: true
    },
    useToken: {
      type: Boolean,
      default: true
    },
    showNextBtn: {
      type: Boolean,
      default: true
    },
    customPreviewRender: {
      type: Function as unknown as () => (
        file: FileProps
      ) => void | string | number | JSX.Element | MyArray<string | number | JSX.Element>,
      default: () => {}
    },
    onPreview: {
      type: Function as unknown as () => (file: FileProps) => true | void,
      default: () => true
    }
  },
  setup(props) {
    const imgData = ref<FileProps[]>([])
    const fileOpts = reactive({
      visible: false,
      index: 0,
      hide: () => {
        fileOpts.visible = false
      }
    })
    const onShowFile = (index: number) => {
      if (props.onPreview(imgData.value[index])) {
        fileOpts.index = index
        fileOpts.visible = true
      }
    }
    const handleUrl = async (url: string, params?: ObjectItem, mime?: string) => {
      if (!url.startsWith('data:') && !url.startsWith('blob:') && props.useToken) {
        return await getBlobUrl(url, params, mime)
      }
      return url
    }
    const handleIcon = (name: string | FileProps) => {
      if (typeof name === 'object') {
        let mimeTypeExt = `.${name.mimeTypeExt || ''}`
        name = (name.fileName || name.path) + mimeTypeExt
      }
      if (name.match(/.pdf$/)) return 'icon-pdf'
      if (name.match(/.(txt|json)$/)) return 'icon-text'
      if (name.match(/.mp4$/)) return 'icon-video'
      if (name.match(/.mp3$/)) return 'icon-music'
      if (name.match(/.(zip|rar)$/)) return 'icon-zip'
      if (name.match(/.ppt$/)) return 'icon-ppt'
      if (name.match(/.(doc|docx)$/)) return 'icon-word'
      if (name.match(/.(xls|xlsx)$/)) return 'icon-excel'
      if (name.match(/.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/)) return 'img'
      return 'icon-file'
    }
    watchEffect(async () => {
      imgData.value = []
      for (let i = 0; i < props.src.length; i++) {
        let ele = props.src[i]
        let icon = ''
        let path = ''
        if (typeof ele == 'string') {
          if (!ele.match(/\.[a-z0-9A.Z]+$/)) {
            path = await handleUrl(ele)
            const blob = await fetch(path).then((res) => res.arrayBuffer())
            let mime = getMimeTypeByBlob(blob)
            icon = handleIcon(mime.ext)
          } else {
            icon = handleIcon(ele)
          }
          if (icon == 'img') {
            imgData.value.push({
              path,
              fileName: ele.match(/[^/]+$/)![0],
              mimeTypeIcon: icon
            })
          } else {
            imgData.value.push({
              path: ele as string,
              fileName: ele.match(/[^/]+$/)![0],
              mimeTypeIcon: icon
            })
          }
        } else {
          icon = handleIcon(ele)
          if (icon == 'img') {
            if (ele.fileId) {
              path = await handleUrl(props.downloadUrl, {
                id: ele.fileId
              })
            } else if (ele.path) {
              path = await handleUrl(ele.path)
            }
            imgData.value.push({
              ...ele,
              mimeTypeIcon: icon,
              path
            })
          } else {
            if (
              icon == 'icon-file' &&
              !ele.mimeTypeExt &&
              !ele.path?.match(/\.[a-z0-9A.Z]+$/) &&
              !ele.fileName?.match(/\.[a-z0-9A.Z]+$/)
            ) {
              if (ele.fileId) {
                path = await handleUrl(props.downloadUrl, {
                  id: ele.fileId
                })
              } else if (ele.path) {
                path = await handleUrl(ele.path)
              }
              const blob = await fetch(path).then((res) => res.arrayBuffer())
              let mime = getMimeTypeByBlob(blob)
              icon = handleIcon(mime.ext)
              if (icon == 'img') {
                imgData.value.push({
                  ...ele,
                  mimeTypeIcon: icon,
                  path
                })
                continue
              }
            }
            imgData.value.push({ ...ele, mimeTypeIcon: icon })
          }
        }
      }
    })
    return () => {
      return [
        imgData.value.length
          ? imgData.value.map((item, i) => {
              return (
                <div class="j-card-viewer">
                  {item.mimeTypeIcon == 'img' ? (
                    <VanImage
                      fit="cover"
                      style="margin: 4px; cursor: pointer"
                      onClick={() => onShowFile(i)}
                      src={item.path}
                      width={props.size}
                      height={props.size}
                      v-slots={{
                        error: () => $t('加载失败')
                      }}
                    ></VanImage>
                  ) : (
                    <VanImage
                      fit="cover"
                      style="margin: 4px; cursor: pointer"
                      onClick={() => onShowFile(i)}
                      width={props.size}
                      height={props.size}
                      v-slots={{
                        error: () => <JIcon type={item.mimeTypeIcon}></JIcon>
                      }}
                    />
                  )}
                  {props.showName ? (
                    <div class="j-card-viewer-name" style={{ width: `${props.size}px` }}>
                      {item.fileName}
                    </div>
                  ) : null}
                </div>
              )
            })
          : $t(props.emptyText),
        fileOpts.visible ? (
          <JFileViewer
            {...fileOpts}
            showName={props.showName}
            showNextBtn={props.showNextBtn}
            src={imgData.value}
            customPreviewRender={props.customPreviewRender}
            useToken={props.useToken}
          ></JFileViewer>
        ) : null
      ]
    }
  }
})
