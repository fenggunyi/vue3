import { useEventListener } from '@vueuse/core'
import { type Ref, defineComponent, inject, onMounted, ref } from 'vue'

let isPhone = !!navigator.userAgent.match(
  /(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i
)

export default defineComponent({
  name: 'JDragger',
  props: {
    initialValue: {
      type: Object as () => { x: number; y: number }
    }
  },
  setup(props, { slots, expose }) {
    const viewZoom = inject<Ref<number>>('zoom', ref(1))
    const viewer = ref()
    let pressedDelta = ref<{ x: number; y: number; distance?: number; zoom?: number }>()
    let position = ref<{ x: number; y: number }>(props.initialValue || { x: 0, y: 0 })
    let zoom = ref<number>(1)
    const start = (e: PointerEvent) => {
      if (e instanceof TouchEvent && e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.sqrt(
          (touch1.pageX - touch2.pageX) ** 2 + (touch1.pageY - touch2.pageY) ** 2
        )
        pressedDelta.value = {
          x: (touch1.pageX - touch2.pageX) / 2,
          y: (touch1.pageY - touch2.pageY) / 2,
          distance: distance,
          zoom: zoom.value
        }
      } else {
        const pos = {
          x: e.pageX - position.value.x,
          y: e.pageY - position.value.y
        }
        pressedDelta.value = pos
      }
    }
    const move = (e: PointerEvent) => {
      if (!pressedDelta.value) return
      if (e instanceof TouchEvent && e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.sqrt(
          (touch1.pageX - touch2.pageX) ** 2 + (touch1.pageY - touch2.pageY) ** 2
        )
        zoom.value =
          ((distance / pressedDelta.value.distance!) * pressedDelta.value.zoom!) / viewZoom.value
        position.value = {
          x: touch1.pageX - pressedDelta.value.x,
          y: touch1.pageY - pressedDelta.value.y
        }
        console.log(position.value)
      } else {
        position.value = {
          x: e.pageX - pressedDelta.value.x,
          y: e.pageY - pressedDelta.value.y
        }
      }
    }
    const end = () => {
      if (!pressedDelta.value) return
      pressedDelta.value = undefined
    }
    const setPosition = (pos: { x: number; y: number }, newZoom = zoom.value) => {
      position.value = pos
      zoom.value = newZoom
    }
    onMounted(() => {
      if (isPhone) {
        useEventListener(viewer.value, 'touchstart', start)
        useEventListener(window, 'touchmove', move)
        useEventListener(window, 'touchend', end)
      } else {
        useEventListener(viewer.value, 'mousedown', start)
        useEventListener(window, 'mousemove', move)
        useEventListener(window, 'mouseup', end)
      }
    })
    expose({
      setPosition
    })
    return () => {
      return (
        <div
          ref={viewer}
          style={{
            position: 'absolute',
            left: position.value.x + 'px',
            top: position.value.y + 'px',
            transform: `scale(${zoom.value})`
          }}
        >
          {slots.default?.()}
        </div>
      )
    }
  }
})
