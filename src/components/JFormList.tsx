import './JFormList.less'

import { $t } from 'utils'
import { computed, defineComponent, nextTick, ref, watch } from 'vue'
import { baseFormProps, type JFormItem } from './JBaseForm'
import { Button } from 'vant'
import JForm from './JForm'

export default defineComponent({
  name: 'JFormList',
  emits: ['update:modelValue', 'change', 'delete'],
  props: {
    /** 表单数据，实现v-model */
    modelValue: {
      type: Array as () => ObjectItem[],
      default: () => []
    },
    /** 新增显示的文本 */
    addText: {
      type: String,
      default: '新增配置'
    },
    /** 是否隐藏新增按钮 */
    hideAdd: Boolean,
    /** 是否可以拖拽 */
    canDrag: {
      type: Boolean,
      default: true
    },
    /** 是否隐藏删除按钮 */
    hideRemove: Boolean,
    ...baseFormProps,
    autoLabelWidth: {
      type: Boolean,
      default: true
    },
    /** FormItem配置项 */
    items: {
      type: [Array, Function] as unknown as () =>
        | JFormItem[]
        | ((formData: ObjectItem[], index: number) => JFormItem[]),
      default: () => [],
      required: true
    }
  },
  setup(props, { expose, emit }) {
    let values = ref<ObjectItem[]>(props.modelValue)
    let draggingItem = ref<ObjectItem | null>()
    let draggingIndex = ref<number>(),
      targetIndex = ref<number>()
    const onAdd = () => {
      values.value.push({})
    }
    const handleDragStart = (item: ObjectItem) => {
      draggingItem.value = item
      draggingIndex.value = values.value.findIndex((i) => i === draggingItem.value)
    }
    const handleDragOver = (e: DragEvent, item: ObjectItem) => {
      e.preventDefault()
      targetIndex.value = values.value.findIndex((i) => i === item)
    }
    const handleDragEnd = () => {
      if (
        draggingIndex.value != undefined &&
        targetIndex.value != undefined &&
        draggingIndex.value !== targetIndex.value
      ) {
        values.value.splice(draggingIndex.value, 1)
        values.value.splice(targetIndex.value, 0, draggingItem.value!)
        emit('update:modelValue', values.value)
        emit('change', values.value)
      }
      draggingIndex.value = undefined
      targetIndex.value = undefined
      draggingItem.value = null
    }
    const forms = computed(() => {
      return values.value.map((value, i) => {
        let items: JFormItem[] = []
        if (typeof props.items === 'function') {
          items = props.items(values.value, i)
        } else {
          items = props.items
        }
        const refDom = (
          <JForm
            index={i}
            modelValue={value}
            onUpdate:modelValue={(val) => {
              values.value[i] = val
              emit('update:modelValue', values.value)
              emit('change', values.value)
            }}
            formListData={values.value}
            items={items}
            autoLabelWidth={props.autoLabelWidth}
            labelWidth={props.labelWidth}
          />
        )
        nextTick(() => {
          refDom.component?.exposed?.setFields(value)
        })
        return [
          refDom,
          <div
            class={{
              'j-form-list-item': true,
              'j-form-list-dragging': value === draggingItem.value
            }}
            {...(props.canDrag
              ? {
                  draggable: true,
                  onDragstart: () => handleDragStart(value),
                  onDragover: (e) => handleDragOver(e, value),
                  onDragend: handleDragEnd
                }
              : null)}
          >
            <div class="drag-block" style={{ width: props.canDrag ? '8px' : 0 }}></div>
            <div
              draggable
              onDragstart={(e) => {
                e.preventDefault()
              }}
            >
              <div
                class={{
                  'j-form-list-line-top': true,
                  'j-form-list-over':
                    draggingIndex.value != undefined &&
                    targetIndex.value != undefined &&
                    draggingIndex.value > targetIndex.value &&
                    i == targetIndex.value
                }}
              ></div>
              {refDom}
              <div
                class={{
                  'j-form-list-line': true,
                  'j-form-list-over':
                    draggingIndex.value != undefined &&
                    targetIndex.value != undefined &&
                    draggingIndex.value < targetIndex.value &&
                    i == targetIndex.value
                }}
              ></div>
            </div>
            {props.hideRemove ? null : (
              <Button
                style={{ marginTop: '10px' }}
                type="danger"
                icon="delete-o"
                onClick={() => {
                  values.value.splice(i, 1)
                  values.value = [...values.value]
                  emit('update:modelValue', values.value.length ? values.value : undefined)
                  emit('delete', value)
                  emit('change', values.value.length ? values.value : undefined)
                }}
              />
            )}
          </div>
        ]
      })
    })
    const setValue = (val?: ObjectItem[]) => {
      values.value = val || []
    }
    const validate = async () => {
      const res = await Promise.all(
        forms.value.map((form) => form[0].component?.exposed?.validate())
      )
      if (res.every((r) => r)) {
        return res
      } else {
        return false
      }
    }
    watch(
      () => props.modelValue,
      (val) => {
        setValue(val)
      }
    )
    expose({ setValue, validate })
    return () => {
      return (
        <div>
          {forms.value.map((e) => e[1])}
          {props.hideAdd ? null : (
            <Button type="default" icon="plus" block onClick={onAdd}>
              {$t(props.addText)}
            </Button>
          )}
        </div>
      )
    }
  }
})
