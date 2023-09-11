import './JFileViewer.less'

import { $t, baseRequest, getMimeTypeByBlob } from 'utils'
import { Loading, Field, NavBar } from 'vant'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import JDragger from './JDragger'
import JIcon from './JIcon'
import api from '@/api'

interface FileProps {
  path: string
  fileId?: string
  fileName?: string
  mimeTypeType?: string
  value?: string
}

export default defineComponent({
  name: 'JFileViewer',
  emits: ['update:index'],
  props: {
    /** 是否显示头 */
    showHeader: {
      type: Boolean,
      default: true
    },
    /** 是否显示 */
    visible: Boolean,
    /** 后端预览或下载地址 */
    downloadUrl: {
      type: String,
      default: () => api.downloadUrl
    },
    /** 是否是内联样式，默认false，即全屏弹窗 */
    inline: Boolean,
    /** 文件地址数组 */
    src: {
      type: Array as () => string[] | FileProps[],
      default: () => [],
      required: true
    },
    /** 是否展示名称 */
    showName: {
      type: Boolean,
      default: true
    },
    /** 禁止显示下一个按钮 */
    showNextBtn: {
      type: Boolean,
      default: true
    },
    /** 是否启用鉴权模式 */
    useToken: {
      type: Boolean,
      default: true
    },
    /** 展示的索引 */
    index: {
      type: Number,
      default: 0
    },
    /** 关闭，仅在弹窗模式下生效 */
    hide: {
      type: Function,
      default: () => {}
    },
    /** 文件下载逻辑 */
    onDownload: Function,
    /** 自定义预览渲染 */
    customPreviewRender: {
      type: Function as unknown as () => (
        file: FileProps
      ) => void | string | number | JSX.Element | MyArray<string | number | JSX.Element>,
      default: () => {}
    }
  },
  setup(props, { slots, expose, emit }) {
    let viewer = ref<HTMLElement>()
    let showItem = ref<FileProps>()
    let loading = ref(false)
    let index = ref(props.index)
    let imgRef = ref()

    const getBlobUrl = async (url: string, params: ObjectItem = {}, mime?: string) => {
      const { data } = await baseRequest(url, params, { blob: true })
      if (mime) {
        return URL.createObjectURL(new Blob([data], { type: mime }))
      } else {
        return URL.createObjectURL(data)
      }
    }
    // 处理文件列表
    const handleUrl = async (url: string, params: ObjectItem = {}, mime?: string) => {
      if (!url.startsWith('data:') && !url.startsWith('blob:') && props.useToken) {
        return await getBlobUrl(url, params, mime)
      }
      return url
    }

    const handleMimeType = async (name: string | FileProps, path: string) => {
      if (typeof name === 'object') {
        if (name.mimeTypeType) return name.mimeTypeType
        name = name.fileName || name.path
      }
      if (name.match(/.pdf$/)) return 'application/pdf'
      if (name.match(/.(txt|json)$/)) return 'text/plain'
      if (name.match(/.mp4$/)) return 'video/mp4'
      if (name.match(/.mp3$/)) return 'audio/mp3'
      if (name.match(/.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/)) return 'image/*'
      if (!name.match(/\.[a-z0-9A.Z]+$/)) {
        const blob = await fetch(path).then((res) => res.arrayBuffer())
        return getMimeTypeByBlob(blob).type
      }
      return 'application/octet-stream'
    }
    const handleItems = async (item: string | FileProps) => {
      loading.value = true
      let path = ''
      let fileName = ''
      let mimeTypeType = ''
      let value = ''
      if (typeof item === 'string') {
        path = await handleUrl(item)
        mimeTypeType = await handleMimeType(item, path)
      } else {
        if (item.fileId) {
          if (item.mimeTypeType) {
            path = await handleUrl(props.downloadUrl, { id: item.fileId }, item.mimeTypeType)
            mimeTypeType = await handleMimeType(item, path)
          } else {
            path = await handleUrl(props.downloadUrl, { id: item.fileId })
            mimeTypeType = await handleMimeType(item, path)
            const blob = await fetch(path).then((res) => res.arrayBuffer())
            path = URL.createObjectURL(new Blob([blob], { type: mimeTypeType }))
          }
        } else if (item.path) {
          path = await handleUrl(item.path)
          mimeTypeType = await handleMimeType(item, path)
        }
        fileName = item.fileName || ''
      }
      loading.value = false
      if (mimeTypeType?.includes('text')) {
        value = await fetch(path).then((res) => res.text())
      }
      return { path, fileName, mimeTypeType, value }
    }
    const onLoadImgOk = (e: Event) => {
      let target = e.target as HTMLImageElement
      let boxWidth = (viewer.value?.offsetWidth ?? target.width)
      let boxHeight = (viewer.value?.offsetHeight ?? target.height)
      let scaleW = target.width / boxWidth
      let scaleH = target.height / boxHeight
      if (scaleH > scaleW) {
        target.style.width = boxHeight * (target.width / target.height) + 'px'
      } else if (target.width > boxWidth) {
        target.style.width = boxWidth + 'px'
      } else {
        target.style.width = target.width + 'px'
      }
      target.style.height = 'auto'
    }
    const onWheel = (e: WheelEvent) => {
      let target = e.target as HTMLImageElement
      if (e.deltaY > 0) {
        //缩小
        let width = target.getBoundingClientRect().width * 0.5
        if (width > 100) {
          target.style.width = width + 'px'
        }
      } else if (e.deltaY < 0) {
        //放大
        let width = target.getBoundingClientRect().width * 2
        if (width < (viewer.value?.offsetWidth ?? target.width) * 3) {
          target.style.width = width + 'px'
        }
      }
      target.style.height = 'auto'
    }
    const renderFile = () => {
      let { path, mimeTypeType, value } = showItem.value || {}
      let result = props.customPreviewRender(showItem.value!)
      if (result === undefined) {
        if (mimeTypeType?.includes('image')) {
          return (
            <JDragger
              ref={imgRef}
              initialValue={{
                x: (viewer.value?.offsetWidth || window.innerWidth) / 2,
                y: (viewer.value?.offsetHeight || window.innerHeight) / 2
              }}
            >
              <img
                src={path}
                draggable={false}
                onLoad={onLoadImgOk}
                onClick={(e) => e.stopPropagation()}
                onWheel={onWheel}
              />
            </JDragger>
          )
        } else if (mimeTypeType?.includes('video')) {
          return <video src={path} controls></video>
        } else if (mimeTypeType?.includes('audio')) {
          return <audio src={path} controls></audio>
        } else if (mimeTypeType?.includes('pdf')) {
          return <iframe src={path + '#toolbar=0'} frameborder="0"></iframe>
        } else if (mimeTypeType?.includes('text')) {
          return (
            <div class="text-viewer">
              <Field value={value} type="textarea" readonly></Field>
            </div>
          )
        } else {
          return (
            <div class="not-support">
              <div>{$t('该文件不支持预览')}</div>
            </div>
          )
        }
      } else {
        return result
      }
    }
    const visible = computed(() => {
      return props.inline || props.visible
    })
    const setPosition = (pos: { x: number; y: number }) => {
      imgRef.value?.setPosition(pos)
    }
    watch(
      visible,
      async (val) => {
        if (val && props.src.length) {
          showItem.value = await handleItems(props.src[props.index % props.src.length])
        }
      },
      { immediate: true }
    )
    watch(
      () => props.index,
      (val) => {
        index.value = val
        if (index.value >= props.src.length && props.src.length) {
          index.value = 0
          emit('update:index', 0)
        }
      }
    )
    watch(index, async (val) => {
      if (visible.value && props.src.length) {
        showItem.value = await handleItems(props.src[val])
      }
    })
    watch(
      () => props.src,
      async () => {
        if (visible.value && props.src.length) {
          index.value = 0
          showItem.value = await handleItems(props.src[0])
          emit('update:index', 0)
        }
      }
    )
    onMounted(() => {
      // 如果不是内联样式，则创建一个全屏弹窗
      if (!props.inline && viewer.value) {
        document.getElementById('appweb')?.appendChild(viewer.value)
      }
    })
    onUnmounted(() => {
      if (!props.inline && viewer.value) {
        document.getElementById('appweb')?.removeChild(viewer.value)
      }
    })
    expose({
      setPosition
    })
    return () => {
      return (
        <div
          class={`j-file-viewer ${props.inline ? 'j-file-viewer-inline' : 'j-file-viewer-modal'}`}
          onClick={() => props.hide()}
          v-show={visible.value}
          ref={viewer}
        >
          {props.showHeader ? (
            <NavBar
              title={props.showName ? showItem.value?.fileName || '未命名' : $t('文件预览')}
              leftArrow
              onClickLeft={() => props.hide()}
              left-text="关闭"
              v-slots={{
                right: () => {
                  return slots.btns?.({
                    data: props.src[index.value],
                    index: index.value
                  })
                }
              }}
            ></NavBar>
          ) : null}
          <div style={`position: relative;height: 100%;`}>
            {loading.value ? <Loading class="loading" /> : renderFile()}
            {props.src.length > 1 && props.showNextBtn
              ? [
                  <div
                    class="left-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      index.value--
                      if (index.value < 0) {
                        index.value = props.src.length - 1
                      }
                      emit('update:index', index.value)
                    }}
                  >
                    <JIcon type="icon-left" />
                  </div>,
                  <div
                    class="right-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      index.value++
                      if (index.value >= props.src.length) {
                        index.value = 0
                      }
                      emit('update:index', index.value)
                    }}
                  >
                    <JIcon type="icon-right" />
                  </div>
                ]
              : null}
            {showItem.value?.mimeTypeType?.includes('pdf') && !props.showHeader ? (
              <div class="pdf-close-btn" onClick={() => props.hide()}>
                <JIcon type="plus" rotate={45} />
              </div>
            ) : null}
          </div>
        </div>
      )
    }
  }
})
