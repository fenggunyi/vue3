import { $j, $t, getDictByName, translateList } from 'utils'
import {
  Form,
  Field,
  Row,
  Col,
  RadioGroup,
  Radio,
  type FieldRule,
  CheckboxGroup,
  Checkbox
} from 'vant'
import dayjs from 'dayjs'
import {
  createVNode,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  watch,
  watchEffect,
  type Component,
  type Raw,
  type VNode,
  computed
} from 'vue'
import JSelect from './JSelect'
import JRangePicker from './JRangePicker'
import JDatePicker from './JDatePicker'
import JCascader from './JCascader'
import JUpload from './JUpload'
import JSearchSelect from './JSearchSelect'

export type JFormItem = {
  customRender?: (
    formData: ObjectItem,
    item: JFormItem
  ) => string | number | JSX.Element | MyArray<string | number | JSX.Element>
  cpt?:
    | Raw<Component>
    | Component
    | 'cascader'
    | 'input'
    | 'number'
    | 'textarea'
    | 'select'
    | 'searchSelect'
    | 'rangePicker'
    | 'radio'
    | 'checkbox'
    | 'datePicker'
    | 'timePicker'
    | 'upload'
  title?: string
  name?: string
  labelAlign?: 'left' | 'right'
  help?: string
  extra?: string
  style?: string
  className?: string
  required?: boolean
  disabled?: boolean | ((value: ObjectItem) => boolean)
  dictName?: string
  dictRowKey?: string
  placeholder?: string
  defaultValue?: any
  value?: any
  col?: number
  slots?: { [props: string]: () => JSX.Element }
  show?: boolean | ((value: ObjectItem) => boolean)
  sort?: number
  destoryOnHide?: boolean
  bind?: ObjectItem & {
    options?: LabelValue[]
    onValueChange?: (data: {
      value: any
      setFields: (val: ObjectItem) => void
      index: number
      formData: ObjectItem
      compRefs: ObjectItem
    }) => void
  }
  formatIn?: (value: any) => any
  formatOut?: (value: any) => any
  /** labelWidth 为0时即隐藏label, 子的优先级比父级高，autoLabelWidth优先级高于labelWidth */
  labelWidth?: number
  autoLabelWidth?: boolean
  rules?: FieldRule[]
  validator?: (value: any, formData: ObjectItem, index: number) => string | undefined
  [prop: string]: any
}

export type JBaseFormProps = {
  /** 是否自动计算label宽度 默认不计算 */
  autoLabelWidth?: boolean
  /** label的宽度 默认150 设置0即隐藏 */
  labelWidth?: number
  /** FormItem配置项 */
  items?: JFormItem[]
  /** 多语言显示配置 */
  textTransform?: 'capitalize' | 'uppercase' | 'lowercase' | 'none'
  /** 覆盖项 */
  overrides?: JFormItem[]
}

// 获取时间类型的FormItem
export const getTimeItems = (items: JFormItem[]) => {
  let timeItems: JFormItem[] = []
  items.forEach((item) => {
    if (['rangePicker', 'datePicker', 'timePicker'].includes(item.cpt as string)) {
      timeItems.push(item)
    }
  })
  return timeItems
}

// 将用户传入的时间类型转为表单需要使用的值
export const formatTimeItemsToForm = (
  timeItems: JFormItem[],
  value: ObjectItem,
  onChange?: (val: any) => void
) => {
  let hasChange = false
  timeItems.forEach((item) => {
    if (item.name) {
      if (item.cpt === 'rangePicker') {
        let names = item.name.split(',')
        if (value[names[0]] && value[names[1]]) {
          value[item.name] =
            value[names[0]] && value[names[1]]
              ? [dayjs(value[names[0]]), dayjs(value[names[1]])]
              : []
        }
        delete value[names[0]]
        delete value[names[1]]
      } else if (item.cpt === 'datePicker') {
        if (value[item.name]) {
          value[item.name] = dayjs(value[item.name])
        } else if (item.defaultValue) {
          value[item.name] = dayjs(item.defaultValue)
          hasChange = true
        }
      }
    }
  })
  if (hasChange) onChange?.({ ...value })
  return value
}

// 将表单的时间格式转为用户需要使用的值
export const formatTimeItemsToUser = (timeItems: JFormItem[], value: ObjectItem) => {
  timeItems.forEach((item) => {
    if (item.name) {
      if (item.cpt === 'rangePicker') {
        let names = item.name.split(',')
        const format = item.bind?.format
        const [startFormat, endFormat] = (
          typeof format == 'string'
            ? [format, format]
            : Array.isArray(format)
            ? format
            : ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59']
        ) as [string, string]
        let start = value[item.name]?.[0]
        let end = value[item.name]?.[1]
        value[names[0]] = typeof start == 'string' ? start : start?.format(startFormat)
        value[names[1]] = typeof end == 'string' ? end : end?.format(endFormat)
        delete value[item.name]
      } else if (item.cpt == 'datePicker') {
        let time = value[item.name]
        value[item.name] =
          typeof time == 'string' ? time : time?.format(item.bind?.format ?? 'YYYY-MM-DD HH:mm:ss')
      }
    }
  })
  return value
}

export const baseFormProps = {
  /** 是否自动计算label宽度 默认不计算 */
  autoLabelWidth: {
    type: Boolean,
    default: false
  },
  /** label的宽度 默认150 设置0即隐藏 */
  labelWidth: {
    type: Number,
    default: 150
  },
  /** FormItem配置项 */
  items: {
    type: Array as () => JFormItem[],
    default: () => []
  },
  /** 计数用，无视 */
  index: {
    type: Number,
    default: 0
  },
  /** 多语言显示配置 */
  textTransform: {
    type: String as () => 'capitalize' | 'uppercase' | 'lowercase' | 'none',
    default: 'capitalize'
  },
  /** 覆盖项 */
  overrides: Object as () => JFormItem[]
}

export default defineComponent({
  name: 'JBaseForm',
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: {
      type: Object as () => ObjectItem,
      default: () => ({}),
      required: true
    },
    formListData: Array as () => ObjectItem[],
    ...baseFormProps
  },
  setup(props, { emit, expose, slots }) {
    const form = ref()
    let nodeList: [JFormItem, VNode][] = []
    let formItems = ref<JFormItem[]>([])
    let modelValue = { ...props.modelValue }
    // 表当数据变化时执行
    const onChange = (item: JFormItem, val: any) => {
      if (item.name) {
        modelValue[item.name] = item.formatOut ? item.formatOut(val) : val
        emit('update:modelValue', modelValue)
        emit('change', modelValue, [item.name])
        nextTick(() => {
          form.value.validate([item.name])
          nextTick(() => {
            if (item.bind?.onValueChange) {
              item.bind.onValueChange({
                value: val,
                setFields,
                formData: modelValue,
                index: props.index,
                compRefs: compRefs.value
              })
            }
          })
        })
      }
    }
    // 根据类型渲染每个项
    const renderJFormItem = (v: JFormItem, rules: FieldRule[]) => {
      const disabled =
        typeof v.disabled === 'function'
          ? v.disabled(props.modelValue)
          : typeof v.disabled === 'boolean'
          ? v.disabled
          : false
      const commonProps = {
        class: v.className,
        disabled,
        formData: props.modelValue,
        rules,
        label: v.title,
        name: v.name,
        style: v.style,
        required: v.required,
        labelAlign: v.labelAlign,
        ...v.bind
      }
      if (v.name) {
        let value = v.formatIn ? v.formatIn(props.modelValue[v.name]) : props.modelValue[v.name]
        let node: VNode
        switch (v.cpt) {
          case 'input':
            node = (
              <Field
                {...commonProps}
                modelValue={value}
                onUpdate:modelValue={(e: any) => onChange(v, e)}
                placeholder={
                  v.placeholder ? $t(v.placeholder) : $j($t('请输入'), $t(v.title, {}, 'lowercase'))
                }
                v-slots={v.slots || {}}
              ></Field>
            )
            break
          case 'number':
            node = (
              <Field
                {...commonProps}
                modelValue={value}
                type="number"
                onUpdate:modelValue={(e: any) => onChange(v, e)}
                placeholder={
                  v.placeholder ? $t(v.placeholder) : $j($t('请输入'), $t(v.title, {}, 'lowercase'))
                }
                v-slots={v.slots || {}}
              ></Field>
            )
            break
          case 'textarea':
            node = (
              <Field
                {...commonProps}
                modelValue={value}
                type="textarea"
                onUpdate:modelValue={(e: any) => onChange(v, e)}
                placeholder={
                  v.placeholder ? $t(v.placeholder) : $j($t('请输入'), $t(v.title, {}, 'lowercase'))
                }
                v-slots={v.slots || {}}
              ></Field>
            )
            break
          case 'select':
            node = (
              <JSelect
                {...commonProps}
                modelValue={value}
                options={translateList(v.bind?.options || [], ['label'], 'capitalize') as any[]}
                onUpdate:modelValue={(e: any) => onChange(v, e)}
                placeholder={
                  v.placeholder ? $t(v.placeholder) : $j($t('请选择'), $t(v.title, {}, 'lowercase'))
                }
                v-slots={v.slots || {}}
              />
            )
            break
          case 'searchSelect':
            node = (
              <JSearchSelect
                {...commonProps}
                modelValue={value}
                options={translateList(v.bind?.options || [], ['label'], 'capitalize') as any[]}
                onUpdate:modelValue={(e: any) => onChange(v, e)}
                placeholder={
                  v.placeholder ? $t(v.placeholder) : $j($t('请选择'), $t(v.title, {}, 'lowercase'))
                }
                v-slots={v.slots || {}}
              />
            )
            break
          case 'radio':
            node = (
              <Field
                {...commonProps}
                v-slots={{
                  input: () => {
                    return (
                      <RadioGroup
                        modelValue={value}
                        onUpdate:modelValue={(e: any) => onChange(v, e)}
                        direction="horizontal"
                      >
                        {translateList(v.bind?.options || [], ['label'], 'capitalize').map(
                          (item) => (
                            <Radio name={item.value}>{item.label}</Radio>
                          )
                        )}
                      </RadioGroup>
                    )
                  },
                  ...v.slots
                }}
              ></Field>
            )
            break
          case 'checkbox':
            node = (
              <Field
                {...commonProps}
                v-slots={{
                  input: () => {
                    return (
                      <CheckboxGroup
                        modelValue={value}
                        onUpdate:modelValue={(e: any) => onChange(v, e)}
                        direction="horizontal"
                      >
                        {translateList(v.bind?.options || [], ['label'], 'capitalize').map(
                          (item) => (
                            <Checkbox name={item.value} shape="square">
                              {item.label}
                            </Checkbox>
                          )
                        )}
                      </CheckboxGroup>
                    )
                  },
                  ...v.slots
                }}
              ></Field>
            )
            break
          case 'rangePicker':
            node = (
              <JRangePicker
                {...commonProps}
                modelValue={value}
                onUpdate:modelValue={(e: any) => onChange(v, e)}
                placeholder={
                  (v.placeholder ? v.placeholder : [$t('开始时间'), $t('结束时间')]) as [
                    string,
                    string
                  ]
                }
                v-slots={v.slots || {}}
              />
            )
            break
          case 'datePicker':
            node = (
              <JDatePicker
                {...commonProps}
                modelValue={value}
                onUpdate:modelValue={(e: any) => onChange(v, e)}
                placeholder={
                  v.placeholder ? $t(v.placeholder) : $j($t('请选择'), $t(v.title, {}, 'lowercase'))
                }
                v-slots={v.slots || {}}
              />
            )
            break
          case 'cascader':
            node = (
              <JCascader
                {...commonProps}
                modelValue={value}
                options={translateList(v.bind?.options || [], ['label']) as any[]}
                placeholder={v.placeholder ? $t(v.placeholder) : $j($t('请选择'), $t(v.title))}
                onUpdate:modelValue={(e: any) => onChange(v, e)}
                v-slots={v.slots || {}}
              />
            )
            break
          case 'upload':
            node = (
              <Field
                {...commonProps}
                label-align="top"
                v-slots={{
                  input: () => {
                    return (
                      <JUpload
                        {...commonProps}
                        modelValue={value}
                        onUpdate:modelValue={(e) => onChange(v, e)}
                        v-slots={v.slots || {}}
                      />
                    )
                  }
                }}
              />
            )
            break
          default:
            node = createVNode(
              v.cpt!,
              {
                ...commonProps,
                modelValue: value,
                'onUpdate:modelValue': (e: any) => onChange(v, e)
              },
              v.slots || {}
            )
        }
        nodeList.push([v, node])
        return node
      } else {
        return v.customRender?.(props.modelValue, v)
      }
    }
    const renderFormItem = (v: JFormItem) => {
      let rules: FieldRule[] = [
        {
          required: v.required,
          message:
            $t(
              [
                'cascader',
                'select',
                'rangePicker',
                'radio',
                'checkbox',
                'datePicker',
                'timePicker',
                'upload'
              ].includes(v.cpt as string)
                ? '请选择'
                : '请输入'
            ) + $t(v.title, {}, 'lowercase')
        },
        ...(v.rules ?? [])
      ]
      if (v.validator) {
        rules.push({
          validator: (_: any, b: any) => {
            return new Promise((resolve) => {
              nextTick(() => {
                const validatorMsg = v.validator?.(
                  b,
                  props.formListData || props.modelValue,
                  props.index
                )
                return typeof validatorMsg == 'string' ? resolve(validatorMsg) : resolve(true)
              })
            })
          }
        })
      }
      return !v.title && v.customRender
        ? v.customRender(props.modelValue, v)
        : renderJFormItem(v, rules)
    }
    // 渲染表单项
    const renderItem = (v: JFormItem) => {
      const show =
        typeof v.show === 'function'
          ? v.show(props.modelValue)
          : typeof v.show === 'boolean'
          ? v.show
          : true
      return show ? <Col span={v.col ?? 24}>{renderFormItem(v)}</Col> : null
    }
    const setDefaultFields = () => {
      let value: ObjectItem = {}
      let nameList: string[] = []
      let hasChange = false
      formItems.value.forEach((v) => {
        if (v.name) {
          if (props.modelValue[v.name] !== undefined) {
            if (v.value !== undefined && props.modelValue[v.name] !== v.value) {
              value[v.name] = v.value
              nameList.push(v.name)
              hasChange = true
            } else {
              value[v.name] = props.modelValue[v.name]
              nameList.push(v.name)
            }
          } else if (v.defaultValue !== undefined) {
            value[v.name] = v.value ?? v.defaultValue
            nameList.push(v.name)
            hasChange = true
          } else if (v.value !== undefined) {
            value[v.name] = v.value
            nameList.push(v.name)
            hasChange = true
          }
        }
      })
      if (hasChange) {
        emit('update:modelValue', value)
        emit('change', value, nameList)
        nextTick(() => {
          form.value.validate(nameList)
        })
      }
    }
    // 重置表单
    const resetFields = () => {
      let value: ObjectItem = {}
      formItems.value.forEach((v) => {
        if (v.name) {
          if (v.defaultValue !== undefined) {
            value[v.name] = v.defaultValue
          } else if (v.cpt && typeof v.cpt !== 'string') {
            callResetFields(v)
          }
        }
      })
      emit('update:modelValue', value)
      emit('change', value, [])
    }
    const validate = () => {
      return new Promise(async (resolve, reject) => {
        for (let i = 0; i < nodeList.length; i++) {
          const [v, node] = nodeList[i]
          const show =
            typeof v.show === 'function'
              ? v.show(props.modelValue)
              : typeof v.show === 'boolean'
              ? v.show
              : true
          if (show) {
            if ((await node.component?.exposed?.validate?.()) === false) {
              reject(false)
              return
            }
          } else if (v.destoryOnHide && v.name && modelValue[v.name] !== undefined) {
            delete modelValue[v.name]
          }
        }
        nextTick(() => {
          form.value
            .validate()
            .then(() => {
              resolve({ ...modelValue })
            })
            .catch(() => {
              reject(false)
            })
        })
      })
    }
    const validateFields = (nameList: string[]) => {
      form.value.validate(nameList)
    }
    const callResetFields = (item: JFormItem) => {
      formItems.value.find((v) => v == item)?.node?.component?.exposed?.resetFields?.()
    }
    const clearValidate = (nameList?: string[]) => {
      form.value.resetValidation(nameList)
    }
    const getRefs = (name: string) => {
      return formItems.value.find((v) => v.name == name)?.node?.component?.exposed
    }
    const setFields = (val: ObjectItem) => {
      let nameList: string[] = []
      let hasChange = false
      Object.keys(val).forEach((key) => {
        const item = props.items.find((i) => i.name === key)
        if (item && modelValue[key] !== val[key]) {
          modelValue[key] = val[key]
          nameList.push(key)
          hasChange = true
        }
      })
      if (hasChange) {
        emit('update:modelValue', modelValue)
        emit('change', modelValue, nameList)
        nextTick(() => {
          form.value.validate(nameList)
        })
      }
    }
    const compRefs = computed(() => {
      let opts: ObjectItem = {}
      nodeList.forEach(([v, node]) => {
        if (v.name) {
          opts[v.name] = node.component?.exposed
        }
      })
      return opts
    })
    watchEffect(async () => {
      let items: JFormItem[] = []
      let itemList = props.items
      if (props.overrides) {
        let names = new Set(props.items.map((e) => e.name).filter((e) => e))
        let ignore: any[] = []
        itemList = props.items.map((e) => {
          if (names.has(e.name)) {
            let item = props.overrides?.find((i) => i.name == e.name)
            names.delete(e.name)
            ignore.push(e.name)
            return { ...e, ...item }
          } else return e
        })
        itemList = itemList.concat(props.overrides.filter((e) => !ignore.includes(e.name)))
        itemList.sort((a, b) => (a.sort || 99) - (b.sort || 99))
      }
      for (let i = 0; i < itemList.length; i++) {
        let item = itemList[i]
        if (item.dictName) {
          item.bind = item.bind || {}
          item.bind.options = await getDictByName(item.dictName, item.dictRowKey)
        }
        items.push(item)
      }
      formItems.value = items
    })
    watchEffect(() => {
      modelValue = { ...props.modelValue }
    })
    watch(formItems, () => {
      setDefaultFields()
    })
    onMounted(() => {
      setDefaultFields()
    })
    expose({
      resetFields,
      setFields,
      validate,
      validateFields,
      clearValidate,
      getRefs
    })
    return () => {
      nodeList = []
      return (
        <Form ref={form}>
          <Row gutter={8}>{formItems.value?.map(renderItem)}</Row>
          {slots.last?.()}
        </Form>
      )
    }
  }
})
