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
    </div>
  </header>
</template>

<script setup lang="ts">

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
  
  .logo-text {
    display: none;
  }
  
  .tagline {
    display: none;
  }
}
</style>