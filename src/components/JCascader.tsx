import { $t, baseRequest, deepFind, deepMap, findTreePath } from 'utils'
import {
  Cascader,
  Field,
  Popup,
  showFailToast,
  type FieldRule,
  showLoadingToast,
  closeToast
} from 'vant'
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'

export default defineComponent({
  name: 'JCascader',
  emits: ['update:modelValue', 'change'],
  props: {
    /** 实现vue3的v-model */
    modelValue: String,
    name: String,
    label: String,
    required: Boolean,
    rules: Array as unknown as () => FieldRule[],
    /** 下拉数据项 */
    options: {
      type: Array as () => LabelValue[],
      default: () => [],
      validator: (value: any[]) => {
        // 检查options的每一项是否有label和value属性
        if (value.length === 0) return true
        let result = value.every(
          (option) => option.hasOwnProperty('label') && option.hasOwnProperty('value')
        )
        if (!result) {
          console.error('options的每一项必须有label和value属性 ->', value)
        }
        return result
      }
    },
    /** placeholder */
    placeholder: {
      type: String,
      default: () => $t('请选择')
    },
    /** 是否禁用 */
    disabled: {
      type: Boolean,
      default: false
    },
    /** 表格查询配置 */
    query: Function as unknown as () => (row?: ObjectItem) => QueryItem,
    /** 是否自动加载数据 */
    autoLoad: {
      type: Boolean,
      default: true
    },
    /** 数据格式化（对全部数据，不是单行） */
    format: {
      type: Function,
      default: ({ code, data, msg }: ObjectItem) => {
        if (code === 200) {
          return data
        } else {
          showFailToast(msg)
          return []
        }
      }
    }
  },
  setup(props, { emit, expose }) {
    const showPicker = ref(false)
    const modelValue = ref<string | undefined>(props.modelValue)
    const state = reactive({
      options: props.options
    })
    // 加载Options
    const loadOptions = async ({ value }: any) => {
      const targetOption = deepFind(state.options, (item) => item.value == value)
      if (props.query) {
        if (targetOption?.children) return
        showLoadingToast('加载中...')
        if (targetOption) {
          const { url, ...params } = props.query(targetOption)
          let { data } = await baseRequest(url, params)
          targetOption.children = props.format(data)
          state.options = [...(state.options || [])]
        } else {
          const { url, ...params } = props.query()
          let { data } = await baseRequest(url, params)
          state.options = props.format(data)
        }
        closeToast()
      }
    }
    const resetFields = () => {
      loadOptions([])
      emit('update:modelValue', [])
      emit('change', [])
    }
    const result = computed<string | undefined>(() => {
      let path = findTreePath(state.options, (item) => item.value == modelValue.value)
      return path?.map((item) => item.label).join('/')
    })
    const onConfirm = () => {
      emit('update:modelValue', modelValue.value)
      showPicker.value = false
    }
    onMounted(() => {
      props.autoLoad && state.options.length == 0 && loadOptions([])
    })
    watch(
      () => props.options,
      (val) => {
        state.options = val
      }
    )
    const onOpen = () => {
      if (props.disabled) return
      showPicker.value = true
    }
    expose({ resetFields })
    return () => {
      return (
        <div>
          <Field
            modelValue={result.value}
            is-link
            readonly
            disabled={props.disabled}
            required={props.required}
            name={props.name}
            label={props.label}
            placeholder={props.placeholder}
            rules={props.rules}
            onClick={onOpen}
          />
          <Popup
            show={showPicker.value}
            onUpdate:show={(val) => (showPicker.value = val)}
            position="bottom"
          >
            <Cascader
              modelValue={modelValue.value}
              onUpdate:modelValue={(val) => (modelValue.value = val)}
              options={deepMap(state.options, (item) => {
                return {
                  text: item.label,
                  value: item.value
                }
              })}
              onChange={loadOptions}
              onClose={(val) => (showPicker.value = val)}
              onFinish={onConfirm}
            />
          </Popup>
        </div>
      )
    }
  }
})
