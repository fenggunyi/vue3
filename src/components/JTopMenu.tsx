import './JTopMenu.less'

import { computed, defineComponent, nextTick, ref, watch } from 'vue'
import JBaseForm, {
  formatTimeItemsToForm,
  formatTimeItemsToUser,
  getTimeItems,
  type JFormItem
} from './JBaseForm'
import { Button, Icon } from 'vant'

export type JTopMenuProps = {
  /** 表单数据，实现v-model */
  modelValue?: ObjectItem
  /** FormItem配置项 */
  items?: JSearchItem[]
  /** 是否隐藏label */
  hideLabel?: boolean
  /** label宽度 */
  labelWidth?: number
  /** 查询方法 */
  query?: (...args: any) => void
  /** 是否隐藏查询按钮 */
  hideSearch?: boolean
  /** 是否隐藏重置按钮 */
  hideReset?: boolean
  /** 覆盖项 */
  overrides?: JFormItem[]
}

export type JSearchItem = JFormItem & {
  /** 是否变化时自动调用query */
  autoQuery?: boolean
  /** 是否自动隐藏 */
  autoHide?: boolean
}

export const JTopMenuPropsItem = {
  /** 表单数据，实现v-model */
  modelValue: {
    type: Object as () => ObjectItem,
    default: () => ({})
  },
  /** FormItem配置项 */
  items: {
    type: Array as () => JSearchItem[],
    default: () => []
  },
  /** 是否隐藏label */
  hideLabel: Boolean,
  /** label宽度 */
  labelWidth: {
    type: Number,
    default: 100
  },
  /** 查询方法 */
  query: Function as unknown as () => (...args: any) => void,
  /** 是否隐藏查询按钮 */
  hideSearch: Boolean,
  /** 是否隐藏重置按钮 */
  hideReset: Boolean,
  /** 覆盖项 */
  overrides: Array as () => JSearchItem[]
}

export default defineComponent({
  name: 'JTopMenu',
  emits: ['update:modelValue', 'change'],
  props: JTopMenuPropsItem,
  setup(props, { emit, slots, expose }) {
    const form = ref()
    const modelValue = ref(props.modelValue)
    let showSearch = ref(true)
    let timeItems = ref<JFormItem[]>([])
    const onReset = () => {
      form.value.resetFields()
      nextTick(onQuery)
    }
    const queryItems = computed(() => {
      return props.items?.map((v) => {
        v.className = 'top-menu-box' + (v.className ? ' ' + v.className : '')
        return v
      })
    })
    const formValue = computed(() => {
      return formatTimeItemsToForm(timeItems.value, { ...modelValue.value }, (val) => {
        val = formatTimeItemsToUser(timeItems.value, val)
        emit('update:modelValue', val)
        emit('change', val)
      })
    })
    const getRefs = (name: string) => {
      return form.value.getRefs(name)
    }
    const onQuery = () => {
      form.value.validate().then((val: any) => {
        val = formatTimeItemsToUser(timeItems.value, val)
        props.query?.(val)
      })
    }
    watch(
      () => props.items,
      (val) => {
        timeItems.value = getTimeItems(val)
      },
      { immediate: true }
    )
    watch(
      () => props.modelValue,
      (val) => {
        modelValue.value = val
      }
    )
    expose({ getRefs })
    return () => {
      return (
        <div class="j-top-menu">
          {queryItems.value?.length ? (
            <div class="j-top-menu-box">
              <JBaseForm
                ref={form}
                modelValue={formValue.value}
                onUpdate:modelValue={(val) => {
                  modelValue.value = formatTimeItemsToUser(timeItems.value, { ...val })
                  emit('update:modelValue', modelValue.value)
                  emit('change', modelValue.value)
                }}
                onChange={(val, nameList) => {
                  emit('change', val, nameList)
                  // 仅允许单个字段变化时自动调用query
                  if (nameList.length === 1) {
                    const item = props.items.find((v) => v.name === nameList[0])
                    if (item?.autoQuery) {
                      onQuery()
                    }
                  }
                }}
                items={queryItems.value.filter((v) => !v.autoHide || !showSearch.value)}
                autoLabelWidth={props.hideLabel ? false : true}
                labelWidth={props.hideLabel ? 0 : props.labelWidth}
                overrides={props.overrides}
              />
            </div>
          ) : null}
          {[
            props.hideSearch ? null : (
              <Button
                type="primary"
                style={{ width: props.hideReset ? '100%' : '50%', borderRadius: 0 }}
                onClick={onQuery}
              >
                查询
              </Button>
            ),
            props.hideReset ? null : (
              <Button
                style={{ width: props.hideSearch ? '100%' : '50%', borderRadius: 0 }}
                onClick={onReset}
              >
                重置
              </Button>
            ),
            slots.default?.()
          ]}
          {slots.bottom?.()}
          {queryItems.value.filter((v) => v.autoHide).length ? (
            <div class="j-drop-btn" onClick={() => (showSearch.value = !showSearch.value)}>
              <Icon name={showSearch.value ? 'arrow-down' : 'arrow-up'} />
            </div>
          ) : null}
        </div>
      )
    }
  }
})
