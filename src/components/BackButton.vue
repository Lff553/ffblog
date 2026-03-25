<!-- src/components/BackButton.vue -->
<template>
  <div class="back-button-container">
    <a
      class="back-link"
      @click="handleBack"
      href="javascript:void(0)"
    >
      <span class="back-icon">←</span>
      <span class="back-text">返回</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 计算属性
const canGoBack = computed(() => {
  return window.history.length > 1
})

// 返回处理
const handleBack = () => {
  if (canGoBack.value) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.back-button-container {
  display: inline-block;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  position: relative;
  background: transparent;
  border: none;
  user-select: none;
}

.back-link:hover {
  color: #1890ff;
  transform: translateX(-3px);
}

.back-link:active {
  transform: translateX(-1px);
}

.back-icon {
  font-size: 1.1rem;
  font-weight: 500;
  transition: transform 0.3s;
}

.back-link:hover .back-icon {
  transform: translateX(-2px);
}

.back-text {
  font-size: 0.9rem;
  font-weight: 400;
}

/* 下划线效果 */
.back-link::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0;
  width: 0;
  height: 1px;
  background: #1890ff;
  transition: width 0.3s;
}

.back-link:hover::after {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .back-link {
    padding: 6px 10px;
    font-size: 0.9rem;
  }
  
  .back-text {
    font-size: 0.85rem;
  }
  
  .back-icon {
    font-size: 1rem;
  }
}
</style>