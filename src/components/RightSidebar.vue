<template>
  <aside class="sidebar">
    <!-- 热门文章 -->
    <div class="widget">
      <h3 class="widget-title">🔥 热门文章</h3>
      <ul class="hot-posts">
        <li
          v-for="post in popularPosts"
          :key="post.id"
          class="hot-post"
          @click="viewPost(post.id)"
        >
          <div class="hot-post-content">
            <h4>{{ post.title }}</h4>
            <div class="hot-post-meta">
              <span>👁️ {{ post.views }}</span>
              <span>📅 {{ formatDateShort(post.date) }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <!-- 最新文章 -->
    <div class="widget">
      <h3 class="widget-title">🆕 最新文章</h3>
      <ul class="recent-posts">
        <li
          v-for="post in recentPosts"
          :key="post.id"
          class="recent-post"
          @click="viewPost(post.id)"
        >
          <div class="recent-post-content">
            <h4>{{ post.title }}</h4>
            <div class="recent-post-meta">
              <span>📅 {{ formatDateShort(post.date) }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- 文章归档 -->
    <div class="widget">
      <h3 class="widget-title">🗂️ 文章归档</h3>
      <ul class="archive">
        <li
          v-for="item in archive"
          :key="`${item.year}-${item.month}`"
          class="archive-item"
          @click="$emit('filter-archive', item.year, item.month)"
        >
          <span class="archive-date">{{ item.year }}年{{ item.month }}月</span>
          <span class="archive-count">{{ item.count }}篇</span>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {  computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '../stores/post'

const router = useRouter()
const blogStore = useBlogStore()

// 定义组件事件
const emit = defineEmits<{
  'filter-category': [category: string]
  'filter-tag': [tag: string]
  'filter-archive': [year: number, month: number]
  'search': [keyword: string]
  'create-post': []
  'manage-posts': []
  'export-data': []
}>()

// 计算属性
const popularPosts = computed(() => blogStore.getPopularPosts(5))
const recentPosts = computed(() => blogStore.getRecentPosts(5))
const categories = computed(() => blogStore.getAllCategories())
const tags = computed(() => blogStore.getAllTags())
const archive = computed(() => blogStore.getArchive())

// 方法
const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const viewPost = (postId: number) => {
  router.push(`/post/${postId}`)
  blogStore.incrementViews(postId)
}


</script>

<style scoped>
.sidebar {
 display: flex;
  flex-direction: column;
  gap: 15px;
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

/* 热门文章 */
.hot-posts {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-post {
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
}

.hot-post:last-child {
  border-bottom: none;
}

.hot-post:hover {
  transform: translateX(8px);
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), transparent);
  border-radius: 6px;
  padding: 8px 12px;
  margin: 0 -12px;
}

.hot-post::after {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: #667eea;
  border-radius: 2px;
  transition: height 0.2s;
}

.hot-post:hover::after {
  height: 60%;
}

.hot-post-content h4 {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hot-post-meta {
  display: flex;
  gap: 12px;
  color: #666;
  font-size: 0.8rem;
}

.hot-post-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}


/* 最新文章 */
.recent-posts {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-post {
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
}

.recent-post:last-child {
  border-bottom: none;
}

.recent-post:hover {
  transform: translateX(8px);
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), transparent);
  border-radius: 6px;
  padding: 8px 12px;
  margin: 0 -12px;
}

.recent-post::before {
  content: '→';
  position: absolute;
  left: -15px;
  top: 50%;
  transform: translateY(-50%) scale(0);
  color: #667eea;
  font-weight: bold;
  transition: transform 0.2s;
}

.recent-post:hover::before {
  transform: translateY(-50%) scale(1);
}

.recent-post-content h4 {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recent-post-meta {
  color: #666;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 文章归档 */
.archive {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.archive-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  background: #f8f9fa;
  border: 1px solid transparent;
}

.archive-item:hover {
  background: linear-gradient(135deg, #f0f2ff, #f8f9fa);
  border-color: #667eea;
  color: #667eea;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.archive-date {
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.archive-date::before {
  content: '📅';
  font-size: 0.8rem;
  opacity: 0.7;
}

.archive-count {
  font-size: 0.8rem;
  color: #666;
  background: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.2s;
}

.archive-item:hover .archive-count {
  background: #667eea;
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: static;
    max-height: none;
    overflow-y: visible;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .tags-cloud {
    justify-content: center;
  }
}
</style>