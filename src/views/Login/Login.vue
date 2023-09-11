<style lang="less">
.Login-page {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(0, #cee7f5, #247acd);

  .login-box {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    text-align: center;
    width: 100%;
    color: #fff;

    .title {
      font-size: 36px;
      text-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
    }

    .sub-title {
      margin-top: 58px;
      font-size: 20px;
      font-weight: bold;
    }

    .bg {
      position: absolute;
      width: 100%;
      top: 18px;
      left: 0;
      z-index: -1;
    }

    .input-box1 {
      position: relative;
      margin: 32px auto 0;
      display: grid;
      grid-template-columns: 38px 1fr;
      width: 280px;
      height: 38px;
      border-radius: 19px;
      overflow: hidden;
      background-color: white;

      .icon {
        color: #247acd;
        height: 38px;
        line-height: 38px;
        font-size: 20px;

        & > * {
          position: relative;
          left: 1px;
        }
      }

      .input {
        position: relative;
        height: 20px;
        top: 9px;
        border-left: 1px solid #aaa;

        input {
          position: relative;
          border: none;
          height: 20px;
          line-height: 20px;
          width: 100%;
          padding: 0 10px;
          color: #247acd;
        }
      }
    }

    .input-box2 {
      .input-box1;
      margin-top: 16px;
      grid-template-columns: 38px 1fr 38px;

      input {
        width: 184px !important;
      }

      .eye-icon {
        color: #aaa;
        line-height: 38px;
      }
    }

    .login-btn {
      position: relative;
      width: 280px;
      margin-top: 32px;
    }
  }
}
.login-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
<template>
  <div v-if="showLoginView" class="Login-page">
    <div class="login-box">
      <div class="title">h5模板</div>
      <div class="sub-title">用户登录</div>
      <!-- <img class="bg" src="assets/bg.png" /> -->
      <div class="input-box1">
        <div class="icon">
          <Icon name="manager" />
        </div>
        <div class="input">
          <input v-model="username" placeholder="请输入账号" />
        </div>
      </div>
      <div class="input-box2">
        <div class="icon">
          <Icon name="lock" />
        </div>
        <div class="input">
          <input v-model="password" :type="show ? 'text' : 'password'" placeholder="请输入密码" />
        </div>
        <div class="eye-icon" @click="show = !show">
          <Icon v-if="show" name="eye-o" />
          <Icon v-else name="closed-eye" />
        </div>
      </div>
      <Button
        :loading="appStore.loading"
        class="login-btn"
        round
        type="primary"
        @click="loginSubmit"
        >立即登录</Button
      >
    </div>
  </div>
  <Loading v-else class="login-loading" color="#1989fa"></Loading>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { interceptBack, closeWindow, save } from 'utils'
import { MD5 } from 'crypto-js'
import app from '@/store'
import { Icon, Button, showToast, Loading } from 'vant'
import config from '@/config'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'

let show = ref(false)
let showLoginView = ref(false)
const appStore = app()
let username = ref('')
let password = ref('')
const route = useRoute()

const loginSubmit = async () => {
  if (!username.value || !password.value) {
    showToast('请输入用户名、密码')
    return
  }
  if (
    await appStore.login({
      username: username.value,
      password: MD5(password.value).toString(),
      backUrl: route.query.backUrl as string,
      query: route.query
    })
  ) {
    save(`${config.simpleName}_user`, {
      username: username.value,
      password: password.value
    })
  }
}

interceptBack(closeWindow)

const loginByOpenid = async () => {
  if (route.query.code || import.meta.env.VITE_OPEN_ID) {
    appStore.loginByCode(route.query.code as string, route.query.backUrl as string, route.query)
  } else {
    showLoginView.value = true
  }
}

onMounted(() => {
  loginByOpenid()
})
</script>
