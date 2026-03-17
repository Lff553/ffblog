import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)

// 使用路由和状态管理
app.use(router)
app.use(createPinia())

app.mount('#app')