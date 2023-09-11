<style lang="less">
.Home-page {
  position: relative;
  height: 100%;

  .view-body {
    position: relative;
    overflow: auto;
    height: ~'calc(100% - 50px)';
  }
}
</style>
<template>
  <div class="Home-page">
    <div class="view-body">
      <keep-alive>
        <component :is="cpts" />
      </keep-alive>
    </div>
    <Tabbar v-model="active">
      <TabbarItem icon="apps-o" name="ShouYe">首页</TabbarItem>
      <TabbarItem icon="contact" name="Personal">个人中心</TabbarItem>
    </Tabbar>
  </div>
</template>
<script setup lang="ts">
import ShouYe from './cpts/ShouYe.vue'
import Personal from './cpts/Personal.vue'
import { computed, ref } from 'vue'
import { Tabbar, TabbarItem } from 'vant'

let active = ref('ShouYe')

let cpts = computed(() => {
  if (active.value == 'ShouYe') {
    return ShouYe
  } else {
    return Personal
  }
})
</script>
