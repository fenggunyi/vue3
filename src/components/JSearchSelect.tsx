import './JSearchSelect.less'

import { computed, defineComponent, ref, watch } from 'vue'
import { Field, Popup, Search, type FieldRule, Cell, Loading } from 'vant'
import JList from './JList'
import { baseRequest, throttle } from 'utils'

export default defineComponent({
  name: 'JSelect',
  emits: ['update:modelValue'],
  props: {
    modelValue: [String, Number],
    name: String,
    label: String,
    disabled: Boolean,
    required: Boolean,
    query: Function as unknown as () => (name: string, formData?: ObjectItem) => QueryItem,
    autoLoad: {
      type: Boolean,
      default: true
    },
    /** 数据格式化（对全部数据，不是单行） */
    format: {
      type: Function as unknown as () => (data: ObjectItem) => ObjectItem[],
      default: (data: ObjectItem) => {
        return data
      }
    },
    rules: Array as unknown as () => FieldRule[],
    options: {
      type: Array as unknown as () => LabelValue[],
      default: () => []
    },
    height: {
      type: String,
      default: '70%'
    },
    /** 默认Option */
    defaultOption: Object as () => LabelValue,
    placeholder: String,
    formData: Object as () => ObjectItem
  },
  setup(props, { emit }) {
    const name = ref('')
    const options = ref<any[]>([])
    const showPicker = ref(false)
    const loading = ref(false)
    const onSearch = throttle(async (value: string) => {
      if (props.query) {
        loading.value = true
        const { url, ...params } = props.query(value, props.formData)
        let { data } = await baseRequest(url, params)
        options.value = props.format(data)
        loading.value = false
      }
    })
    const searchOptions = computed(() => {
      if (props.defaultOption) {
        if (options.value.find((e) => props.defaultOption?.value == e.value)) {
          return options.value
        } else {
          return [props.defaultOption, ...options.value]
        }
      } else {
        return options.value
      }
    })
    const result = computed<string | undefined>(() => {
      let item = searchOptions.value.find((item) => item.value == props.modelValue)
      return item?.label || undefined
    })
    const onOpen = () => {
      if (props.disabled) return
      showPicker.value = true
      if (!options.value.length) onSearch('')
    }
    watch(
      () => props.options,
      (value) => {
        if (!props.query) {
          options.value = value
        }
      }
    )
    return () => {
      return (
        <div>
          <Field
            modelValue={result.value}
            is-link
            readonly
            name={props.name}
            label={props.label}
            disabled={props.disabled}
            placeholder={props.placeholder}
            rules={props.rules}
            required={props.required}
            onClick={onOpen}
          />
          <Popup
            show={showPicker.value}
            onUpdate:show={(val) => (showPicker.value = val)}
            position="bottom"
            style={{ height: props.height }}
          >
            <div class="j-search-select">
              <Search v-model={name.value} onSearch={onSearch}></Search>
              {loading.value ? (
                <div>
                  <Loading class="select-loading" color="#1989fa"></Loading>
                </div>
              ) : (
                <JList
                  dataSource={searchOptions.value}
                  finishedText=""
                  v-slots={{
                    default: (data: LabelValue[]) => {
                      return data.map((item: LabelValue) => {
                        return (
                          <Cell
                            isLink
                            title={item.label}
                            onClick={() => {
                              emit('update:modelValue', item.value)
                              showPicker.value = false
                            }}
                          ></Cell>
                        )
                      })
                    }
                  }}
                ></JList>
              )}
            </div>
          </Popup>
        </div>
      )
    }
  }
})
