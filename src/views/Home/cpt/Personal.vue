<style lang="less">
.Personal-page {
  position: relative;
  height: 100%;
  background-color: rgb(252, 249, 252);

  .top {
    position: relative;
    text-align: center;
    background: linear-gradient(to right, rgb(31, 106, 222), rgb(84, 172, 255));

    .touxiang {
      position: relative;
      margin: 48px 0 16px;
      width: 80px;
      height: 80px;
    }

    .username {
      font-size: 18px;
      font-weight: bold;
      padding-bottom: 24px;
      color: white;
    }
  }

  .login-btn {
    position: relative;
    width: 320px;
    left: 20px;
    font-weight: bold;
    margin-top: 24px;
    border-radius: 8px;
    color: #fff;
    background: linear-gradient(to right, rgb(31, 106, 222), rgb(84, 172, 255));
  }
}
</style>
<template>
  <div class="Personal-page">
    <div class="top">
      <img class="touxiang" :src="user?.avatarUrl ? avatarUrl : 'assets/touxiang2.png'" />
      <div class="username">{{ user?.nickName }}</div>
    </div>
    <CellGroup>
      <Cell title="登录账户" :value="user?.account || '--'" />
      <Cell title="所属机构" :value="user?.organName || '--'" />
      <Cell title="用户角色" :value="user?.roleName || '--'" />
      <Cell title="联系电话" :value="user?.phone || '--'" />
      <Cell title="邮箱地址" :value="user?.email || '--'" />
    </CellGroup>
    <Button class="login-btn" @click="onLogout">退出登录</Button>
  </div>
</template>
<script setup lang="ts">
import { CellGroup, Cell, Button, showConfirmDialog } from 'vant'
import api from '@/api'
import app from '@/store'
import { computed, ref, watch } from 'vue'
import { getBlobUrl, setCookies } from 'utils'

let appStore = app()
let avatarUrl = ref('')
let user: any = computed(() => {
  return appStore.user
})

const onLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出吗？'
  }).then(() => {
    setCookies(`token`, null)
    location.reload()
  })
}

watch(
  () => appStore.user,
  async (value) => {
    if (value) {
      avatarUrl.value = await getBlobUrl(api.downloadUrl, { id: value.avatar })
    } else {
      avatarUrl.value = ''
    }
  },
  { immediate: true }
)
</script>
