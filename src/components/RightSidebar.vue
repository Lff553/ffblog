<template>
  <aside class="sidebar">
    <!-- 最新文章 -->
    <div class="widget">
      <h3 class="widget-title">最新文章</h3>
      <ul class="recent-posts">
        <li
          v-for="post in recentPosts"
          :key="post.id"
          class="recent-post"
          @click="$router.push(`/issues/${post.id}`)"
        >
          <div class="recent-post-content">
            <h4 class="post-title">{{ post.title }}</h4>
            <div class="post-meta">
              <span>{{ formatDate(post.date) }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- 归档 -->
    <div class="widget">
      <h3 class="widget-title">归档</h3>
      <ul class="archives">
        <li
          v-for="archive in archives.slice(0, 6)"
          :key="`${archive.year}-${archive.month}`"
          class="archive-item"
          @click="$emit('filter-archive', archive)"
        >
          <span class="archive-date">
            {{ archive.year }}年{{ archive.month }}月
          </span>
          <span class="archive-count">{{ archive.count }}</span>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed} from 'vue'
import { useBlogStore } from '../stores/post'

const blogStore = useBlogStore()

// 计算属性
const posts = computed(() => blogStore.posts)

const recentPosts = computed(() => {
  return [...posts.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
})


const archives = computed(() => {
  const archiveMap: Record<string, number> = {}
  posts.value.forEach(post => {
    const date = new Date(post.date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const key = `${year}-${month}`
    
    archiveMap[key] = (archiveMap[key] || 0) + 1
  })
  
  return Object.entries(archiveMap)
    .map(([key, count]) => {
      const [year, month] = key.split('-')
      return {
        year: parseInt(year, 10),
        month: parseInt(month, 10),
        count
      }
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
})


// 方法
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}


// 定义 emit
const emit = defineEmits<{
  'filter-category': [category: string]
  'filter-tag': [tag: string]
  'filter-archive': [archive: { year: number; month: number; count: number }]
}>()
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
}
</style>