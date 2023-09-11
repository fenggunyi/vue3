<style lang="less">
body {
  position: relative;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: aliceblue;
  width: 100%;
  height: 100vh;
  user-select: none;
  -webkit-touch-callout: none;
  overflow: hidden;
  .phone-box {
    background-color: #efefef;
    overflow: auto;
  }
  .pc-box {
    position: absolute;
    background-color: #efefef;
    width: 360px;
    height: 640px !important;
    zoom: 1 !important;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    ::-webkit-scrollbar {
      width: 0px;
      height: 8px;
    }
  }
}
</style>
<template>
  <div v-if="route.meta.isPCView">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
  <div v-else :class="{ 'phone-box': isPhone, 'pc-box': !isPhone }" :style="{ zoom, height }">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>
<script setup lang="tsx">
import { provide, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

let isPhone = !!navigator.userAgent.match(
  /(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i
)
let route = useRoute()

// 兼容ios端缩放问题
let lastTouchEnd = 0
document.addEventListener('touchstart', (event) => {
  if (event.touches.length > 1) {
    event.preventDefault()
  }
})
document.addEventListener(
  'touchend',
  (event) => {
    let now = new Date().getTime()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  },
  false
)
document.addEventListener('gesturestart', (event) => {
  event.preventDefault()
})

let zoom = ref(1)
provide('zoom', zoom)

let height = ref('640px')
const resize = () => {
  zoom.value = +(window.innerWidth / 360).toFixed(2)
  height.value = Math.ceil(window.innerHeight / zoom.value) + 'px'
}

onMounted(() => {
  window.addEventListener('resize', resize, false)
  resize()
})
</script>
