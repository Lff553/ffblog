<template>
  <div class="left-sidebar-container">
    <div class="author-card">
      <div class="author-avatar">
        <img src="../assets/avatar.jpg" alt="作者头像" />
      </div>
      <h3 class="author-name">程序员FF</h3>
      <p class="author-bio">专注前端开发 | Vue专家 | 技术分享者</p>
      
      <div class="author-stats">
        <div class="stat-item">
          <span class="stat-number">128</span>
          <span class="stat-label">文章</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">5.2K</span>
          <span class="stat-label">粉丝</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">3年</span>
          <span class="stat-label">经验</span>
        </div>
      </div>
      
      <button class="follow-btn">关注</button>
    </div>
    
        <!-- 分类 -->
    <div class="widget">
      <h3 class="widget-title">📁 分类</h3>
      <ul class="categories">
        <li
          v-for="cat in categories.slice(0, 8)"
          :key="cat.name"
          class="category-item"
          @click="$emit('filter-category', cat.name)"
        >
          <span class="category-name">{{ cat.name }}</span>
          <span class="category-count">{{ cat.count }}</span>
        </li>
      </ul>
    </div>

    <!-- 标签云 -->
    <div class="widget">
      <h3 class="widget-title">🏷️ 标签</h3>
      <div class="tags-cloud">
        <span
          v-for="tag in tags.slice(0, 15)"
          :key="tag.name"
          class="tag-cloud"
          :style="{ fontSize: `${0.8 + (tag.count / 10)}em` }"
          @click="$emit('filter-tag', tag.name)"
        >
          {{ tag.name }}
        </span>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import {  computed } from 'vue'
import { useBlogStore } from '../stores/post'

const blogStore = useBlogStore()


// 计算属性
const categories = computed(() => blogStore.getAllCategories())
const tags = computed(() => blogStore.getAllTags())

</script>


<style scoped>
.left-sidebar-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}


/* 作者卡片 */
.author-card {
  background: white;
  border-radius: 12px;
  padding: 25px 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.author-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.author-avatar {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 15px;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #667eea;
}


.author-name {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.2rem;
}

.author-bio {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.author-stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.4rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: #888;
}

.follow-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}

.follow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}


.widget {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.widget-title {
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
  display: inline-block;
  width: 100%;
}

/* 分类 */
.categories {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  background: #f8f9fa;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.category-item:hover {
  background: #f0f2ff;
  border-color: #667eea;
  color: #667eea;
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.category-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: #667eea;
  transform: scaleY(0);
  transition: transform 0.3s;
  transform-origin: top;
}

.category-item:hover::before {
  transform: scaleY(1);
}

.category-name {
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 1;
  position: relative;
  padding-left: 8px;
}

.category-count {
  font-size: 0.8rem;
  color: #999;
  background: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  z-index: 1;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.category-item:hover .category-count {
  background: #667eea;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transform: scale(1.1);
}

/* 标签云 */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: -4px;
}

.tag-cloud {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
  color: #666;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.tag-cloud:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  border-color: #667eea;
  z-index: 2;
}

.tag-cloud::after {
  content: '#';
  margin-right: 2px;
  opacity: 0.5;
}

.tag-cloud:hover::after {
  opacity: 0.8;
}


/* 响应式 */
@media (max-width: 768px) {
  .author-stats {
    gap: 20px;
  }
  
  .nav-text {
    font-size: 0.85rem;
  }
  
  .tag-item {
    font-size: 0.8rem;
    padding: 4px 10px;
  }
}
</style>