<template>
  <header class="site-header">
    <div class="header-container">
      <!-- Logo区域 -->
      <div class="logo-area">
        <router-link to="/" class="site-logo">
          <div class="logo-icon">📚</div>
          <div class="logo-text">
            <h1>技术博客</h1>
            <p class="tagline">分享 · 学习 · 成长</p>
          </div>
        </router-link>
      </div>
      
      <!-- 主导航 -->
      <nav class="main-nav">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.path">
            <router-link 
              :to="item.path" 
              class="nav-link"
              :class="{ active: $route.path === item.path }"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-text">{{ item.text }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

    </div>
  </header>
</template>

<script setup lang="ts">
// 导航项配置
const navItems = [
  { path: '/', text: '首页', icon: '🏠' },
  { path: '/posts', text: '文章', icon: '📝' },
  { path: '/categories', text: '分类', icon: '📁' },
  { path: '/tags', text: '标签', icon: '🏷️' },
  { path: '/archive', text: '归档', icon: '🗂️' },
  { path: '/about', text: '关于', icon: '👤' }
]
</script>

<style scoped>
.site-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

/* Logo样式 */
.logo-area {
  display: flex;
  align-items: center;
}

.site-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  transition: transform 0.3s;
}

.site-logo:hover {
  transform: translateY(-2px);
}

.logo-icon {
  font-size: 2rem;
  margin-right: 12px;
}

.logo-text h1 {
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0;
  letter-spacing: 0.5px;
}

.tagline {
  font-size: 0.8rem;
  opacity: 0.9;
  margin: 2px 0 0 0;
}

/* 导航菜单 */
.main-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 8px 20px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  transition: all 0.3s;
  font-size: 0.9rem;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-link.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  margin-right: 6px;
  font-size: 1rem;
}


/* 响应式 */
@media (max-width: 768px) {
  .nav-text {
    display: none;
  }
  
  .nav-link {
    padding: 8px 12px;
  }
  
  .nav-icon {
    margin-right: 0;
    font-size: 1.2rem;
  }
  
  .logo-text h1 {
    font-size: 1.2rem;
  }
  
  .tagline {
    display: none;
  }
}
</style>