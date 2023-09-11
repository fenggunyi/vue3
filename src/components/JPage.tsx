import './JPage.less'

import { computed, defineComponent } from 'vue'
import { NavBar } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { interceptBack } from '@/utils'

export default defineComponent({
  name: 'JPage',
  props: {
    hasNav: {
      type: Boolean,
      default: true
    },
    title: String,
    leftText: String,
    onLeftClick: Function,
    rightPath: String,
    onRightClick: Function,
    rightText: String
  },
  setup(props, { slots }) {
    let router = useRouter()
    let route = useRoute()
    const onLeftBtnClick = () => {
      if (props.onLeftClick) {
        props.onLeftClick()
      }
    }
    const onRightBtnClick = () => {
      if (props.onRightClick) {
        props.onRightClick()
      } else if (props.rightPath) {
        router.replace(props.rightPath)
      }
    }
    let navTitle = computed<string>((): string => {
      let title = props.title || route.meta.title
      if (typeof title == 'string') {
        return title
      } else return ''
    })
    interceptBack(onLeftBtnClick)
    return () => {
      return (
        <div class="page-view">
          {props.hasNav ? (
            <NavBar
              title={navTitle.value}
              left-text={props.leftText || '返回'}
              leftArrow
              onClickLeft={onLeftBtnClick}
              onClickRight={onRightBtnClick}
              rightText={props.rightText}
              style="height: 46px;"
              v-slots={slots}
            />
          ) : (
            <div></div>
          )}
          <div class="page-body">
            <div>{slots.top?.()}</div>
            <div class="page-body-view">{slots.default?.()}</div>
            <div>{slots.bottom?.()}</div>
          </div>
        </div>
      )
    }
  }
})
