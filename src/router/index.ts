// router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 定义路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    showSidebar?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: () => import('../views/PostDetail.vue'),
    meta: { title: '文章详情'}, 
    
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: '关于' },
  },
  {
    path: '/add',
    name: 'Add',
    component: () => import('../views/Add.vue'),
    meta: { title: '写文章'}
  }

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 我的博客`
  }
  next()
})

export default router