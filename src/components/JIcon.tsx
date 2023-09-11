import './JIcon.less'

import { defineComponent } from 'vue'

export default defineComponent({
   name: 'JIcon',
   emits: ['click'],
   props: {
      /** 图标名称 */
      type: {
         type: String,
         default: 'inbox',
      },
      /** 图标旋转角度 */
      rotate: {
         type: Number,
         default: 0,
      },
   },
   setup(props, { emit }) {
      return () => {
         return (
            <svg
               onClick={() => {
                  emit('click')
               }}
               class='j-icon'
               style={{ transform: `rotate(${props.rotate}deg)` }}
               aria-hidden='true'
            >
               <use xlinkHref={`#${props.type}`}></use>
            </svg>
         )
      }
   },
})
