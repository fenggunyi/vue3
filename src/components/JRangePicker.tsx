import { computed, defineComponent, ref } from 'vue'
import { Field, Popup, type FieldRule, PickerGroup, DatePicker } from 'vant'
import dayjs from 'dayjs'

export default defineComponent({
  name: 'JSelect',
  emits: ['update:modelValue'],
  props: {
    modelValue: Array as unknown as () => any[],
    name: String,
    label: String,
    disabled: Boolean,
    required: Boolean,
    rules: Array as unknown as () => FieldRule[],
    placeholder: Array as unknown as () => [string, string]
  },
  setup(props, { emit }) {
    const showPicker = ref(false)
    const startTime = ref(
      (props.modelValue ? props.modelValue[0] : dayjs()).format('YYYY-M-D').split('-')
    )
    const endTime = ref(
      (props.modelValue ? props.modelValue[1] : dayjs()).format('YYYY-M-D').split('-')
    )
    const minDate = dayjs().subtract(10, 'year').toDate()
    const maxDate = dayjs().add(10, 'year').toDate()
    const onConfirm = () => {
      let start = dayjs(startTime.value.join('-'))
      let end = dayjs(endTime.value.join('-'))
      if (start.isAfter(end)) {
        emit('update:modelValue', [end, start])
        showPicker.value = false
      } else {
        emit('update:modelValue', [start, end])
        showPicker.value = false
      }
    }
    const result = computed<string | undefined>(() => {
      if (props.modelValue) {
        return (
          props.modelValue[0].format('YYYY-MM-DD') +
          ' - ' +
          props.modelValue[1].format('YYYY-MM-DD')
        )
      }
    })
    const onOpen = () => {
      if (props.disabled) return
      showPicker.value = true
    }
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
            placeholder={props.placeholder?.join(' - ')}
            rules={props.rules}
            onClick={onOpen}
          />
          <Popup
            show={showPicker.value}
            onUpdate:show={(val) => (showPicker.value = val)}
            position="bottom"
          >
            <PickerGroup
              tabs={['开始日期', '结束日期']}
              onConfirm={onConfirm}
              onCancel={() => (showPicker.value = false)}
            >
              <DatePicker
                v-model={startTime.value}
                min-date={minDate}
                max-date={maxDate}
              ></DatePicker>
              <DatePicker
                v-model={endTime.value}
                min-date={minDate}
                max-date={maxDate}
              ></DatePicker>
            </PickerGroup>
          </Popup>
        </div>
      )
    }
  }
})
