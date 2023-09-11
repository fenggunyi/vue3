import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'
import { getCookies, request, save, setCookies } from 'utils'
import api from './api'
import router from './router'
import { showToast } from 'vant'

export type LoginForm = {
  username: string
  password: string
  backUrl?: string
  query: any
}

export type User = {
  id: number
  nickName: string
  avatar: string
  account: string
  organName: string
  organId: string
  roleName: string
  roleId: string
  phone: string
  email: string
  type: number
}

export type Student = {
  id: number
  openid: string
  name: string
  faceFileId: string
  cjm: string
  schoolName: string
  yuanxiName: string
  zhuanyeName: string
  banjiName: string
  schoolId: string
  yuanxiId: string
  phone: string
  zhuanyeId: string
  banjiId: string
  schoolCard: string
}

export default defineStore('store', () => {
  // 登录状态
  let loading = ref(false)
  // 微信未绑定用户openid
  let openid = ref('')
  // 用户信息
  let user = ref<User>()
  // 学生信息
  let student = ref<Student>()
  // 用户登录
  const login = async ({ username, password, backUrl, query }: LoginForm): Promise<boolean> => {
    loading.value = true
    try {
      let token = await request(api.login, { username, password })
      setCookies('token', token)
      delete query.backUrl
      await getAppInfo()
      if (backUrl) {
        router.replace({ path: backUrl, query })
      } else {
        router.replace({ path: '/home', query })
      }
      loading.value = false
      return true
    } catch (e) {
      loading.value = false
      return false
    }
  }
  const loginByCode = async (code: string, backUrl: string, query: any) => {
    if (import.meta.env.VITE_OPEN_ID) {
      openid.value = import.meta.env.VITE_OPEN_ID
    } else {
      openid.value = await request(api.getOpenId, { code })
    }
    let token = await request(api.loginByOpenId, { openid: openid.value })
    setCookies('token', token)
    delete query.code
    delete query.backUrl
    if (backUrl) {
      router.replace({ path: backUrl, query })
    } else {
      router.replace({ path: '/home', query })
    }
  }
  // 获取应用信息
  const getAppInfo = async () => {
    await loadUserInfo()
  }
  const loadUserInfo = async () => {
    user.value = await request(api.getUserInfo)
    if (!user.value) {
      openid.value = await request(api.getUserOpenId)
      student.value = await request('/api/server/getDetail/getStudentDetail', {
        openid: openid.value
      })
    }
  }
  // 用户登出
  const logout = (msg = '退出系统成功') => {
    setCookies('token', null)
    save('openMenus', null)
    msg && showToast(msg)
    setTimeout(() => {
      location.reload()
    }, 1000)
  }
  // 权限验证
  const verify = async (to: RouteLocationNormalized) => {
    let token = getCookies('token')
    if (token) {
      if (['/', '/login'].includes(to.path)) {
        await getAppInfo()
        return '/home'
      } else {
        if (!user.value) {
          await getAppInfo()
        }
        return true
      }
    } else if (to.path !== '/login') {
      if (!['/'].includes(to.fullPath)) {
        return `/login?backUrl=${to.fullPath}`
      } else {
        return '/login'
      }
    }
  }
  return { loading, user, student, openid, login, loginByCode, logout, verify, loadUserInfo }
})
