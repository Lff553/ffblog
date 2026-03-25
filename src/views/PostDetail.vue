<!-- src/views/PostDetail.vue -->
<template>
  <div class="post-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载文章中...</p>
    </div>
    
    <!-- 文章不存在 -->
    <div v-else-if="!post" class="not-found">
      <div class="not-found-icon">📄</div>
      <h2>文章不存在</h2>
      <p>抱歉，您查找的文章可能已被删除或不存在。</p>
      <div class="not-found-actions">
        <button @click="$router.push('/')" class="home-btn">返回首页</button>
        <button @click="$router.go(-1)" class="back-btn">返回上一页</button>
      </div>
    </div>
    
    <!-- 文章内容 -->
    <div v-else class="post-content">
      <BackButton
        :showText="true"
        fallbackPath="/"
      />
      <!-- 文章头部 -->
      <div class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        
        <div class="post-meta">
          <span class="post-author">
            <img :src="authorAvatar" alt="作者头像" class="author-avatar" />
            <span>{{ post.author }}</span>
          </span>
          <span class="post-date">📅 {{ formatDate(post.date) }}</span>
          <span v-if="post.category" class="post-category" >
            {{ post.category }}
          </span>
          <span class="post-views">👁️ {{ post.views }} 阅读</span>
        </div>
      </div>
      
      <!-- 标签 -->
      <div class="post-tags">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="tag"
        >
          #{{ tag }}
        </span>
      </div>
      
      <!-- 文章内容 -->
      <div class="post-body" v-html="compiledContent"></div>
      
      
      <!-- 相邻文章导航 -->
      <div class="post-navigation">
        <button v-if="prevPost" class="nav-btn prev" @click="viewPost(prevPost.id)">
          ← 上一篇：{{ prevPost.title }}
        </button>
        <div v-else class="nav-placeholder"></div>
        
        <button v-if="nextPost" class="nav-btn next" @click="viewPost(nextPost.id)">
          下一篇：{{ nextPost.title }} →
        </button>
        <div v-else class="nav-placeholder"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { useBlogStore } from '../stores/post'
import BackButton from '../components/BackButton.vue'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

// 状态
const loading = ref(false)
const post = ref<any>(null)

// 计算属性
const postId = computed(() => {
  return parseInt(route.params.id as string, 10)
})

// 编译 Markdown
const compiledContent = computed(() => {
  if (!post.value?.content) return ''
  return marked.parse(post.value.content)
})


// 获取作者头像（GitHub 默认头像）
const authorAvatar = computed(() => {
  return `https://avatars.githubusercontent.com/${blogStore.config.owner}`
})

// 相邻文章
const allPosts = computed(() => blogStore.posts)
const prevPost = computed(() => {
  if (!post.value) return null
  const index = allPosts.value.findIndex(p => p.id === post.value.id)
  return index > 0 ? allPosts.value[index - 1] : null
})

const nextPost = computed(() => {
  if (!post.value) return null
  const index = allPosts.value.findIndex(p => p.id === post.value.id)
  return index < allPosts.value.length - 1 ? allPosts.value[index + 1] : null
})

// 加载文章
const loadPost = async () => {
  if (!postId.value) return
  
  loading.value = true
  
  try {
    // 从 store 获取文章
    let foundPost = blogStore.getPostById(postId.value)
    
    if (!foundPost && blogStore.posts.length === 0) {
      // 如果 store 中没有数据，先获取所有文章
      await blogStore.fetchPosts()
      foundPost = blogStore.getPostById(postId.value)
    }
    
    if (foundPost) {
      post.value = foundPost
      // 更新阅读量
      if (!sessionStorage.getItem(`viewed_${postId.value}`)) {
        post.value.views++
        sessionStorage.setItem(`viewed_${postId.value}`, 'true')
      }
    } else {
      post.value = null
    }
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

// 跳转到文章
const viewPost = (id: number) => {
  router.push(`/issues/${id}`)
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载
onMounted(() => {
  loadPost()
})

// 监听路由变化
watch(() => route.params.id, () => {
  loadPost()
})
</script>

<style scoped>
.post-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  color: #666;
  font-size: 1.1rem;
}

/* 文章不存在 */
.not-found {
  text-align: center;
  padding: 100px 0;
}

.not-found-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  opacity: 0.3;
  color: #667eea;
}

.not-found h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.not-found p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.home-btn, .back-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.home-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.back-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.back-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

/* 文章内容 */
.post-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 文章头部 */
.post-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.post-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.2;
  font-weight: 700;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  color: #666;
  font-size: 0.95rem;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #667eea;
}

.post-category {
  background: #f0f2ff;
  color: #667eea;
  padding: 4px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.post-category:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.post-views, .post-likes {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 标签 */
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  background: linear-gradient(135deg, #f0f2ff, #f8f9fa);
  color: #667eea;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.tag:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

/* 文章内容 */
.post-body {
  line-height: 1.8;
  color: #333;
  font-size: 1.125rem;
  margin-bottom: 50px;
}

/* Markdown 样式增强 */
.post-body h1,
.post-body h2,
.post-body h3,
.post-body h4 {
  margin-top: 2em;
  margin-bottom: 0.8em;
  color: #333;
  font-weight: 600;
  position: relative;
  scroll-margin-top: 80px;
}

.post-body h1 { 
  font-size: 2rem; 
  border-bottom: 2px solid #f0f0f0; 
  padding-bottom: 0.5em; 
}

.post-body h2 { 
  font-size: 1.8rem; 
  border-bottom: 1px solid #f0f0f0; 
  padding-bottom: 0.5em; 
}

.post-body h3 { 
  font-size: 1.5rem; 
  color: #444;
}

.post-body h4 { 
  font-size: 1.3rem; 
  color: #555;
}

.post-body p {
  margin: 1.5em 0;
  line-height: 1.8;
  text-align: justify;
}

.post-body ul,
.post-body ol {
  margin: 1.5em 0;
  padding-left: 2.5em;
}

.post-body li {
  margin: 0.5em 0;
  line-height: 1.8;
}

.post-body blockquote {
  border-left: 4px solid #667eea;
  margin: 2em 0;
  padding: 1.5em 2em;
  background: #f8f9fa;
  color: #666;
  border-radius: 0 8px 8px 0;
  position: relative;
  font-style: italic;
}

.post-body blockquote::before {
  content: '"';
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 3rem;
  color: #667eea;
  opacity: 0.2;
  font-family: Georgia, serif;
}

.post-body pre {
  background: #1e1e1e;
  color: #f8f8f2;
  padding: 1.5em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 2em 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  position: relative;
}

.post-body pre::before {
  content: '代码';
  position: absolute;
  top: 0;
  right: 0;
  background: #667eea;
  color: white;
  padding: 4px 12px;
  font-size: 0.8rem;
  border-radius: 0 8px 0 4px;
  font-family: sans-serif;
}

.post-body code {
  background: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
  color: #e74c3c;
}

.post-body a {
  color: #667eea;
  text-decoration: none;
  border-bottom: 1px dashed #667eea;
  transition: all 0.3s;
  font-weight: 500;
}

.post-body a:hover {
  color: #764ba2;
  border-bottom: 1px solid #764ba2;
}

.post-body img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 2em 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  display: block;
}

.post-body img:hover {
  transform: scale(1.01);
}

.post-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 2em 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.post-body th,
.post-body td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.post-body th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.post-body tr:hover {
  background: #f5f7ff;
}

.post-body hr {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  margin: 3em 0;
  opacity: 0.3;
}

/* 操作按钮 */
.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  flex-wrap: wrap;
  gap: 20px;
}

.like-btn, .share-btn, .back-btn, .edit-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.like-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.like-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.like-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.action-right {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.share-btn {
  background: #36a9e1;
  color: white;
}

.share-btn:hover {
  background: #2d8fc6;
  transform: translateY(-2px);
}

.back-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.back-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.edit-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* 相邻文章导航 */
.post-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  gap: 20px;
}

.nav-btn {
  flex: 1;
  padding: 15px 20px;
  background: white;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  color: #333;
}

.nav-btn:hover {
  border-color: #667eea;
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.nav-btn.prev {
  text-align: left;
  padding-left: 40px;
}

.nav-btn.next {
  text-align: right;
  padding-right: 40px;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  transform: translateY(-50%);
  opacity: 0.3;
  transition: opacity 0.3s;
}

.nav-btn.prev::before {
  left: 10px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23667eea'%3E%3Cpath d='M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z'/%3E%3C/svg%3E") no-repeat center;
}

.nav-btn.next::before {
  right: 10px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23667eea'%3E%3Cpath d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E") no-repeat center;
}

.nav-btn:hover::before {
  opacity: 1;
}

.nav-placeholder {
  flex: 1;
  visibility: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-detail {
    padding: 15px;
  }
  
  .post-title {
    font-size: 2rem;
  }
  
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .post-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .like-btn {
    width: 100%;
  }
  
  .action-right {
    width: 100%;
    justify-content: stretch;
  }
  
  .action-right button {
    flex: 1;
  }
  
  .post-navigation {
    flex-direction: column;
  }
  
  .post-body h1 { font-size: 1.8rem; }
  .post-body h2 { font-size: 1.6rem; }
  .post-body h3 { font-size: 1.4rem; }
  .post-body h4 { font-size: 1.2rem; }
  
  .post-body pre {
    padding: 1em;
    font-size: 0.85rem;
  }
}
</style>