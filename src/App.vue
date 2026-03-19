<template>
  <div class="layout-container">
    <!-- 顶部导航 -->
    <Header />
    
    <div class="main-layout">
      <!-- 左侧边栏 -->
      <aside class="left-sidebar">
        <LeftSidebar />
      </aside>
      
      <!-- 主内容区 -->
      <main class="main-content">
        <slot>
          <!-- 默认内容，可由父组件覆盖 -->
          <MainContent />
        </slot>
      </main>
      
      <!-- 右侧边栏 -->
      <aside class="right-sidebar">
        <RightSidebar />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue'
import LeftSidebar from './components/LeftSidebar.vue'
import RightSidebar from './components/RightSidebar.vue'
import MainContent from './components/MainContent.vue'
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-layout {
  display: flex;
  flex: 1;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
  gap: 20px;
}

/* 左侧边栏 - 20% 宽度 */
.left-sidebar {
  flex: 0 0 240px; /* 固定宽度 */
  position: sticky;
  top: 70px; /* 与header高度相同 */
  height: fit-content;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}
/* Webkit浏览器（Chrome, Safari, Edge） */
.left-sidebar::-webkit-scrollbar {
  width: 0;
  height: 0;
}


/* 主内容区 - 60% 宽度 */
.main-content {
  flex: 1; /* 占据剩余空间 */
  min-width: 0; /* 防止内容溢出 */
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

/* 右侧边栏 - 20% 宽度 */
.right-sidebar {
  flex: 0 0 300px; /* 固定宽度 */
  position: sticky;
  top: 70px;
  height: fit-content;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}
/* Webkit浏览器（Chrome, Safari, Edge） */
.right-sidebar::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-layout {
    flex-wrap: wrap;
  }
  
  .left-sidebar {
    flex: 0 0 200px;
  }
  
  .right-sidebar {
    flex: 1;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  
  .left-sidebar,
  .right-sidebar {
    position: static;
    flex: none;
    width: 100%;
    max-height: none;
  }
  
  .main-content {
    order: 2; /* 主内容在中间显示 */
  }
}
</style>