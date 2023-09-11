import { computed, defineComponent, ref } from 'vue'
import { Field, Popup, Picker, type FieldRule } from 'vant'

export default defineComponent({
  name: 'JSelect',
  emits: ['update:modelValue'],
  props: {
    modelValue: [String, Number],
    name: String,
    label: String,
    disabled: Boolean,
    required: Boolean,
    rules: Array as unknown as () => FieldRule[],
    options: {
      type: Array as unknown as () => LabelValue[],
      default: () => []
    },
    placeholder: String
  },
  setup(props, { emit }) {
    const showPicker = ref(false)
    const onConfirm = ({ selectedOptions }: any) => {
      emit('update:modelValue', selectedOptions[0]?.value)
      showPicker.value = false
    }
    const result = computed<string | undefined>(() => {
      let item = props.options.find((item) => item.value == props.modelValue)
      return item?.label || undefined
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
            disabled={props.disabled}
            required={props.required}
            placeholder={props.placeholder}
            rules={props.rules}
            onClick={onOpen}
          />
          <Popup
            show={showPicker.value}
            onUpdate:show={(val) => (showPicker.value = val)}
            position="bottom"
          >
            <Picker
              columns={props.options.map((item) => {
                return {
                  text: item.label,
                  value: item.value
                }
              })}
              onConfirm={onConfirm}
              onCancel={() => (showPicker.value = false)}
            />
          </Popup>
        </div>
      )
    }
  }
})
