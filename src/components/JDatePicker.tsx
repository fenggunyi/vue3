import { computed, defineComponent, ref } from 'vue'
import { Field, Popup, type FieldRule, DatePicker } from 'vant'
import dayjs from 'dayjs'

export default defineComponent({
  name: 'JSelect',
  emits: ['update:modelValue'],
  props: {
    modelValue: Object,
    name: String,
    label: String,
    disabled: Boolean,
    required: Boolean,
    rules: Array as unknown as () => FieldRule[],
    placeholder: String
  },
  setup(props, { emit }) {
    const showPicker = ref(false)
    const dateValue = ref(
      (props.modelValue ? props.modelValue : dayjs()).format('YYYY-M-D').split('-')
    )
    const minDate = dayjs().subtract(10, 'year').toDate()
    const maxDate = dayjs().add(10, 'year').toDate()
    const onConfirm = ({ selectedValues }: any) => {
      emit('update:modelValue', dayjs(selectedValues.join('-')))
      showPicker.value = false
    }
    const result = computed<string | undefined>(() => {
      if (props.modelValue) {
        return props.modelValue.format('YYYY-MM-DD')
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
            name={props.name}
            label={props.label}
            placeholder={props.placeholder}
            rules={props.rules}
            disabled={props.disabled}
            required={props.required}
            onClick={onOpen}
          />
          <Popup
            show={showPicker.value}
            onUpdate:show={(val) => (showPicker.value = val)}
            position="bottom"
          >
            <DatePicker
              v-model={dateValue.value}
              min-date={minDate}
              max-date={maxDate}
              onConfirm={onConfirm}
              onCancel={() => (showPicker.value = false)}
            ></DatePicker>
          </Popup>
        </div>
      )
    }
  }
})
