import { $t, baseRequest, compressImgByFile, fileToBase64, generateUUID, getHeaders } from 'utils'
import { computed, defineComponent, provide, reactive, ref, watch } from 'vue'
import { showFailToast, Uploader, type UploaderFileListItem } from 'vant'
import JFileViewer from './JFileViewer'
import api from '@/api'

interface FileItem {
  uid: string
  name: string
  fileId?: string
  mimeTypeType?: string
  url?: string
  path?: string
}

interface UploadFile extends UploaderFileListItem {
  name: string
  fileId?: string
  mimeTypeType?: string
  response: {
    code: number
    data: ObjectItem[]
    msg?: string
  }
}

export type JUploadProps = {
  /** 用与双向绑定 */
  modelValue?: FileItem[]
  /** 请求头 */
  headers?: ObjectItem
  /** 上传按钮文本覆盖 */
  btnText?: string
  /** 是否仅用于上传 */
  onlyUpload?: boolean
  /** 上传地址 */
  url?: string
  /** 上传文件的后缀，默认全部 */
  accept?: string
  /** 图片是否进行压缩 */
  compress?: boolean
  /** 是否自动上传 */
  autoUpload?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示上传列表 */
  showUploadList?: boolean
  /** 上传的数量限制，如果是单选，直接1 */
  max?: number
  /** 上传文件的大小限制 */
  maxFileSize?: string
  /** 上传前的处理或验证 */
  beforeUpload?: (file: File, fileList: any[]) => boolean
  /** 格式化上传文件的返回值 */
  formatResult?: (files: UploadFile[]) => FileItem[]
  /** 将上传文件的数据转为ant显示的标准, 默认需传入{fileName?,fileId?} */
  format?: (data: any, autoUpload: boolean) => UploadFile | Promise<UploadFile>
  /** 是否开启预览，开启后，将不会抛出预览事件，如果想自定义预览，请设置为false */
  preview?: boolean
  /** 预览 */
  onPreview?: (file: FileItem, index: number, fileList: FileItem[]) => void
}

export default defineComponent({
  name: 'JUpload',
  emits: ['update:modelValue', 'change', 'preview'],
  props: {
    modelValue: Array as () => FileItem[],
    headers: {
      type: Object as () => ObjectItem,
      default() {
        return getHeaders()
      }
    },
    btnText: {
      type: String,
      default: '文件上传'
    },
    onlyUpload: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: () => api.uploadUrl
    },
    accept: {
      type: String,
      default: '*'
    },
    compress: {
      type: Boolean,
      default: true
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showUploadList: {
      type: Boolean,
      default: true
    },
    max: {
      type: Number,
      default: Infinity
    },
    maxFileSize: {
      type: String,
      default: '50MB'
    },
    beforeUpload: Function as unknown as () => (file: File, fileList: any[]) => boolean,
    formatResult: {
      type: Function as unknown as () => (files: UploadFile[]) => FileItem[],
      default(files: UploadFile[]) {
        return files
          .map((file) => {
            if (file.response.code == 200) {
              let data = file.response.data?.[0] ?? false
              if (file.file?.type?.includes('image')) {
                data._file = { content: file.content }
              }
              return data
            } else {
              showFailToast(file.response.msg!)
              return false
            }
          })
          .filter((e) => e)
      }
    },
    format: {
      type: Function as unknown as () => (
        data: any,
        autoUpload: boolean
      ) => UploadFile | Promise<UploadFile>,
      async default(data: ObjectItem, autoUpload: boolean) {
        if (autoUpload) {
          let uuid = generateUUID()
          return {
            uid: data.fileId ?? uuid,
            fileId: data.fileId,
            name: data.fileName ?? uuid,
            url: data.url,
            content: data.content || data._file?.content,
            mimeTypeType: data.mimeTypeType,
            status: 'done',
            response: {
              code: 200,
              data: [data]
            }
          }
        } else {
          let url = data.type.includes('image') ? await fileToBase64(data as File) : undefined
          return {
            uid: data.uid,
            name: data.name,
            url,
            status: 'done',
            mimeTypeType: data.type,
            response: {
              code: 200,
              data: [data]
            }
          }
        }
      }
    },
    preview: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { slots, emit, expose, attrs }) {
    let uploadFileList: any[] = []
    let loading = ref(false)
    let fileList = ref<UploadFile[]>([])
    const fileViewerOpts: any = reactive({
      visible: false,
      src: [],
      index: 0,
      hide: () => {
        fileViewerOpts.visible = false
      }
    })
    const maxSize = computed(() => {
      const sizeStr = props.maxFileSize.toLowerCase()
      let end = sizeStr.match(/[a-z]{1,}$/)?.[0]
      let number = parseFloat(sizeStr)
      switch (end) {
        case 'b':
          return number
        case 'kb':
          return number * 1024
        case 'mb':
          return number * 1024 * 1024
        case 'gb':
          return number * 1024 * 1024 * 1024
        case 'tb':
          return number * 1024 * 1024 * 1024 * 1024
        default:
          return Infinity
      }
    })
    const accept = computed(() => {
      if (props.accept == '*') {
        return undefined
      } else {
        return new RegExp(`(${props.accept.toLowerCase().replace(/,/g, '|')})$`)
      }
    })
    const disabled = computed(() => {
      return props.disabled || loading.value
    })
    const onBeforeUpload = async (file: File, files: any[]) => {
      if (props.max - fileList.value.length == 0) {
        showFailToast($t('文件数量不得超过${max}个', { max: props.max }))
        return false
      }
      if (props.beforeUpload?.(file, files) === false) {
        return false
      }
      if (accept.value?.test(file.name.toLowerCase()) === false) {
        showFailToast(
          $t('文件格式不正确，只能上传${accept}格式的文件', {
            accept: props.accept
          })
        )
        return false
      }
      if (file.size > maxSize.value) {
        showFailToast(
          $t('文件大小不得超过${maxFileSize}', {
            maxFileSize: props.maxFileSize
          })
        )
        return false
      }
      if (props.autoUpload) {
        return file
      } else {
        uploadFileList.push(file)
        emit('update:modelValue', uploadFileList)
        emit('change', uploadFileList)
        if (props.onlyUpload) {
          fileList.value = []
          uploadFileList = []
        }
        return false
      }
    }
    const onChange = async (file: UploadFile) => {
      loading.value = true
      let formData = new FormData()
      if (props.compress && file.file!.type.indexOf('image') > -1) {
        file.file = await compressImgByFile(file.file!)
        formData.append('file', file.file)
      } else {
        formData.append('file', file.file!)
      }
      let { data } = await baseRequest(props.url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      file.response = data
      const result = props.formatResult(fileList.value)
      emit('update:modelValue', result)
      emit('change', result)
      if (props.onlyUpload) {
        fileList.value = []
        uploadFileList = []
      }
      loading.value = false
    }
    // 清空上传列表
    const clear = () => {
      if (fileList.value.length == 0) return
      fileList.value = []
      uploadFileList = []
      emit('update:modelValue', [])
      emit('change', [])
    }
    watch(
      () => props.modelValue,
      async (val = []) => {
        let value: UploadFile[] = []
        for (let i = 0; i < val.length; i++) {
          value.push(await props.format?.(val[i], props.autoUpload))
        }
        fileList.value = value
        uploadFileList = val
        fileViewerOpts.src = value.map((e) => {
          return {
            path: e.url,
            fileId: e.fileId,
            fileName: e.name,
            mimeTypeType: e.mimeTypeType
          }
        })
      },
      { immediate: true, deep: true }
    )
    provide('noClickStop', true)
    expose({ clear })
    return () => {
      return (
        <div>
          <Uploader
            modelValue={fileList.value}
            onUpdate:modelValue={(val: any) => {
              if (props.autoUpload) {
                fileList.value = val
              }
            }}
            preview-full-image={false}
            showUpload={props.onlyUpload ? false : props.showUploadList}
            accept={props.accept}
            before-read={onBeforeUpload}
            after-read={onChange}
            disabled={disabled.value}
            maxCount={props.max}
            maxSize={maxSize.value}
            multiple={props.max - fileList.value.length > 1}
            onClickPreview={(file: any) => {
              let index = fileList.value.findIndex((e) => e.url == file.url)
              if (props.preview) {
                fileViewerOpts.visible = true
                fileViewerOpts.index = index
              } else {
                emit('preview', file, index, fileList.value)
              }
            }}
            {...attrs}
            v-slots={slots}
          ></Uploader>
          <JFileViewer {...fileViewerOpts}></JFileViewer>
        </div>
      )
    }
  }
})
