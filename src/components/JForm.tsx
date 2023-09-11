import { computed, defineComponent, ref, watch } from 'vue'
import JBaseForm, {
  baseFormProps,
  formatTimeItemsToForm,
  formatTimeItemsToUser,
  getTimeItems,
  type JBaseFormProps,
  type JFormItem
} from './JBaseForm'

export type JFormProps = {
  /** 表单数据，实现v-model */
  modelValue?: ObjectItem
  /** 用于JFormList获取父级的值 */
  formListData?: ObjectItem[]
} & JBaseFormProps

export const JFormPropsItem = {
  modelValue: {
    type: Object as () => ObjectItem,
    default: () => ({})
  },
  formListData: Array as () => ObjectItem[],
  ...baseFormProps
}

export default defineComponent({
  name: 'JForm',
  emits: ['update:modelValue', 'change'],
  props: JFormPropsItem,
  setup(props, { expose, slots, emit }) {
    let modelValue = ref<any>(props.modelValue)
    let form = ref()
    let timeItems = ref<JFormItem[]>([])
    const setFields = (val: ObjectItem) => {
      form.value.setFields(formatTimeItemsToForm(timeItems.value, val))
    }
    const resetFields = () => {
      form.value.resetFields()
    }
    const clearFields = () => {
      emit('update:modelValue', {})
      emit('change', {})
    }
    const validate = () => {
      return new Promise((resolve) => {
        form.value
          .validate()
          .then((val: ObjectItem) => {
            resolve(formatTimeItemsToUser(timeItems.value, { ...val }))
          })
          .catch(() => {
            resolve(false)
          })
      })
    }
    const validateFields = (names: string[]) => {
      form.value.validateFields(names)
    }
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
    expose({
      validate,
      setFields,
      resetFields,
      clearFields,
      validateFields,
      getRefs
    })
    return () => {
      return (
        <JBaseForm
          ref={form}
          {...props}
          modelValue={formValue.value}
          onChange={(val) => {
            modelValue.value = formatTimeItemsToUser(timeItems.value, val)
            emit('update:modelValue', modelValue.value)
            emit('change', modelValue.value)
          }}
          v-slots={slots}
        ></JBaseForm>
      )
    }
  }
})
