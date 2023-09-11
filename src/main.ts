import "./main.less"
import 'vant/lib/index.css';
import '@vant/touch-emulator';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

import App from './App.vue'
import router from './router'
import config from './config'
import Store from './store'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')

const loadIconFont = async () => {
  let svgStr = ''
  for (let i = 0; i < config.iconfont.length; i++) {
    const { data } = await axios.get(config.iconfont[i] + '?_=' + Date.now())
    let str = data.match(/<svg>.*?<\/svg>/)[0]
    str = str.replace('<svg>', `<svg from="${config.iconfont[i]}">`)
    svgStr += str
  }
  const dom = document.createElement('div')
  dom.id = '_iconfont_'
  dom.innerHTML = svgStr
  document.body.appendChild(dom)
}

loadIconFont()

const store = Store()
router.beforeEach(async (to) => {
  if (to.meta.title) {
    document.title = `${config.name} - ${to.meta.title}`
  } else {
    document.title = config.name
  }
  if (!to.meta.publicPage) {
    let result = await store.verify(to)
    return result
  }
})

router.afterEach((_, from) => {
  // 页面获取到数据后执行
  let dom = document.getElementById('__loading');
  dom && (dom.style.display = 'none');
  if (from.path == '/login') {
    store.loading = false;
  }
});