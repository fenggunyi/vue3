import './JTitleBar.less'

import { $t } from 'utils'
import { defineComponent } from 'vue'
import JIcon from './JIcon'

export default defineComponent({
  name: 'JTitleBar',
  props: {
    /** 标题名 */
    title: String,
    /** 色块颜色 */
    color: String,
    /** 色块图标 */
    icon: String,
    /** 多语言显示配置 */
    textTransform: {
      type: String as () => 'capitalize' | 'uppercase' | 'lowercase' | 'none',
      default: 'uppercase'
    }
  },
  setup(props, { slots }) {
    return () => {
      return (
        <div class="title-bar">
          <div class="title-top">
            {slots.icon ? (
              slots.icon()
            ) : props.icon ? (
              <JIcon class="title-icon" style={{ color: props.color }} type={props.icon} />
            ) : (
              <div class="title-block" style={{ backgroundColor: props.color }}></div>
            )}
          </div>
          <div
            class="title-text"
            title={props.title}
            style={{ textTransform: props.textTransform }}
          >
            {slots.title ? slots.title() : $t(props.title)}
          </div>
          <div class="title-slot">{slots.default?.()}</div>
        </div>
      )
    }
  }
})
