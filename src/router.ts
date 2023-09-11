import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
/**
 * 未登录状态
 * 1.页面存在，需要鉴权，跳/login，提示登录
 * 2.页面存在，不需要鉴权，正常跳转
 * 3.页面不存在，跳/404
 *
 * 已登录状态
 * 1.页面存在，权限没有该页面，跳/403
 * 2.页面存在，权限有该页面，正常跳转
 * 3.页面不存在，跳/404
 *
 * publicPage: 不需要登录就能看的公共页面
 * publicRootPage: 需要登录后才能看的公共页面
 * hideNav: 是否需要显示导航栏，默认显示
 * 其他：需要有访问权限才能看的页面
 * Tips: 公共页面即没有在系统管理菜单里配置的页面，例如一些附属某个页面的子页面或者是登录页这种
 */
let routes: RouteRecordRaw[] = [
  {
    path: '/login',
    meta: { publicPage: true, title: '登录' },
    component: () => import('./views/Login')
  },
  {
    path: '/home',
    component: () => import('./views/Home')
  },
  { path: '/:pathMatch(.*)', redirect: '/home' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  strict: true
})

export default router
