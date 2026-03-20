<template>
  <div class="home-page">
    <!-- 顶部横幅 -->
    <div class="hero-section">
      <div class="hero-content">

        <!-- 博客统计 -->
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">{{ stats.total }}</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ stats.totalViews }}</span>
            <span class="stat-label">阅读</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ stats.totalLikes }}</span>
            <span class="stat-label">点赞</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ stats.categories }}</span>
            <span class="stat-label">分类</span>
          </div>
        </div>
        
        <!-- 搜索框 -->
        <div class="search-box">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索文章..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">🔍</button>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <div class="container">
        <!-- 控制栏 -->
        <div class="content-controls">
          <div class="filters">
            <!-- 分类筛选 -->
            <div class="filter-dropdown">
              <button class="filter-btn" @click="toggleCategoryDropdown">
                📁 {{ selectedCategory || '所有分类' }}
              </button>
              <div v-if="showCategoryDropdown" class="dropdown-content">
                <button
                  class="dropdown-item"
                  :class="{ active: !selectedCategory }"
                  @click="selectCategory('')"
                >
                  所有分类
                </button>
                <button
                  v-for="cat in categories"
                  :key="cat.name"
                  class="dropdown-item"
                  :class="{ active: selectedCategory === cat.name }"
                  @click="selectCategory(cat.name)"
                >
                  {{ cat.name }} ({{ cat.count }})
                </button>
              </div>
            </div>
            
            <!-- 排序 -->
            <select v-model="sortBy" class="sort-select">
              <option value="date">最新发布</option>
              <option value="views">最多阅读</option>
              <option value="likes">最多点赞</option>
              <option value="title">标题排序</option>
            </select>
            
            <!-- 视图切换 -->
            <div class="view-control">
              <button 
                class="view-btn" 
                :class="{ active: viewMode === 'list' }"
                @click="viewMode = 'list'"
                title="列表视图"
              >
                📃
              </button>
              <button 
                class="view-btn" 
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
                title="网格视图"
              >
                🏔️
              </button>
            </div>
          </div>
          
          <!-- 创建按钮 -->
          <button
            v-if="isAdmin"
            @click="goToCreate"
            class="create-post-btn"
          >
            ✍️ 写文章
          </button>
        </div>
        
        <!-- 活跃筛选器 -->
        <div v-if="selectedCategory || selectedTag || searchKeyword" class="active-filters">
          <span class="filters-label">当前筛选：</span>
          <div class="filter-chips">
            <span v-if="selectedCategory" class="filter-chip">
              {{ selectedCategory }}
              <button @click="clearCategory" class="clear-chip">×</button>
            </span>
            <span v-if="selectedTag" class="filter-chip">
              {{ selectedTag }}
              <button @click="clearTag" class="clear-chip">×</button>
            </span>
            <span v-if="searchKeyword" class="filter-chip">
              "{{ searchKeyword }}"
              <button @click="clearSearch" class="clear-chip">×</button>
            </span>
            <button @click="clearAllFilters" class="clear-all">清除所有</button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="blogStore.isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>加载文章中...</p>
        </div>

        <!-- 文章内容 -->
        <div v-else>
          <!-- 列表视图 -->
          <div v-if="viewMode === 'list'" class="posts-list">
            <article
              v-for="post in paginatedPosts"
              :key="post.id"
              class="post-card list-view"
              @click="viewPost(post.id)"
            >
              
              <!-- 内容 -->
              <div class="post-content">
                <div class="post-header">
                  <h2 class="post-title">{{ post.title }}</h2>
                  <div class="post-meta">
                    <span class="post-date">📅 {{ formatDate(post.date) }}</span>
                  </div>
                </div>
                <p class="post-excerpt">{{ post.excerpt }}</p>
                
                <div class="post-footer">
                  <!-- 标签 -->
                  <div class="post-tags">
                    <span
                      v-for="tag in post.tags"
                      :key="tag"
                      class="tag"
                      @click.stop="filterByTag(tag)"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                </div>
                
                <!-- 管理员操作 -->
                <div v-if="isAdmin" class="post-actions" @click.stop>
                  <button
                    class="action-btn edit-btn"
                    @click="editPost(post.id)"
                    title="编辑"
                  >
                    编辑
                  </button>
                  <button
                    class="action-btn delete-btn"
                    @click="deletePost(post.id)"
                    title="删除"
                  >
                    删除
                  </button>
                </div>
              </div>
            </article>
          </div>
          
          <!-- 网格视图 -->
          <div v-else class="posts-grid">
            <article
              v-for="post in paginatedPosts"
              :key="post.id"
              class="post-card grid-view"
              @click="viewPost(post.id)"
            >
       
              
              <!-- 内容 -->
              <div class="post-content-grid">
                <h3 class="post-title-grid">{{ post.title }}</h3>
                
                <p class="post-excerpt-grid">{{ post.excerpt }}</p>
                
                
                <!-- 标签 -->
                <div class="post-tags-grid">
                  <span
                    v-for="tag in post.tags.slice(0, 2)"
                    :key="tag"
                    class="tag"
                    @click.stop="filterByTag(tag)"
                  >
                    #{{ tag }}
                  </span>
                  <span v-if="post.tags.length > 2" class="tag-more">
                    +{{ post.tags.length - 2 }}
                  </span>
                </div>
              </div>
            </article>
          </div>
          
          <!-- 空状态 -->
          <div v-if="filteredPosts.length === 0" class="empty-state">
            <div class="empty-icon">📄</div>
            <h3>没有找到相关文章</h3>
            <p>尝试其他搜索条件或创建新文章</p>
          </div>

          <!-- 分页 -->
          <div v-if="totalPages > 1" class="pagination">
            <button
              class="page-btn prev"
              :disabled="currentPage === 1"
              @click="prevPage"
            >
              ← 上一页
            </button>
            
            <div class="page-numbers">
              <button
                v-for="page in visiblePages"
                :key="page"
                class="page-btn"
                :class="{ 
                  active: currentPage === page,
                  ellipsis: page === '...'
                }"
                @click="goToPage(page)"
                :disabled="page === '...'"
              >
                {{ page }}
              </button>
            </div>
            
            <button
              class="page-btn next"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              下一页 →
            </button>
            
            <div class="page-info">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </div>
          </div>
        </div>
      </div>

    
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore} from '../stores/post'
import { isLocalAccess } from '../utils/permission'

const router = useRouter()
const blogStore = useBlogStore()

// 响应式数据
const viewMode = ref<'list' | 'grid'>('list')
const sortBy = ref<'date' | 'views' | 'likes' | 'title'>('date')
const currentPage = ref(1)
const postsPerPage = ref(5)
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedTag = ref('')
const showCategoryDropdown = ref(false)

// 检查是否是管理员
const isAdmin = computed(() => isLocalAccess())

// 计算属性
const filteredPosts = computed(() => {
  return blogStore.getAllPosts({
    filterByCategory: selectedCategory.value,
    filterByTag: selectedTag.value,
    searchKeyword: searchKeyword.value,
    sortBy: sortBy.value,
    sortOrder: 'desc'
  })
})

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage.value
  const end = start + postsPerPage.value
  return filteredPosts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / postsPerPage.value)
})

const stats = computed(() => blogStore.getStats())
const categories = computed(() => blogStore.getAllCategories())
const popularPosts = computed(() => blogStore.getPopularPosts(5))

// 可见页码
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// 方法
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}


const viewPost = (id: number) => {
  router.push(`/post/${id}`)
  blogStore.incrementViews(id)
}

const editPost = (id: number) => {
  if (!isAdmin.value) {
    alert('无权限编辑文章')
    return
  }
  router.push(`/edit/${id}`)
}

const deletePost = async (id: number) => {
  if (!isAdmin.value) {
    alert('无权限删除文章')
    return
  }
  
  if (confirm('确定要删除这篇文章吗？')) {
    const success = blogStore.deletePost(id)
    if (success) {
      alert('文章已删除')
      resetToFirstPage()
    } else {
      alert('删除失败')
    }
  }
}

const filterByTag = (tag: string) => {
  selectedTag.value = tag
  selectedCategory.value = ''
  resetToFirstPage()
}

const selectCategory = (category: string) => {
  selectedCategory.value = category
  showCategoryDropdown.value = false
  resetToFirstPage()
}

const toggleCategoryDropdown = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value
}

const handleSearch = () => {
  resetToFirstPage()
}

const clearCategory = () => {
  selectedCategory.value = ''
  resetToFirstPage()
}

const clearTag = () => {
  selectedTag.value = ''
  resetToFirstPage()
}

const clearSearch = () => {
  searchKeyword.value = ''
  resetToFirstPage()
}

const clearAllFilters = () => {
  selectedCategory.value = ''
  selectedTag.value = ''
  searchKeyword.value = ''
  resetToFirstPage()
}

const goToCreate = () => {
  router.push('/add')
}

// 分页方法
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToTop()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToTop()
  }
}

const goToPage = (page: number | string) => {
  if (typeof page === 'number') {
    currentPage.value = page
    scrollToTop()
  }
}

const resetToFirstPage = () => {
  currentPage.value = 1
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.filter-dropdown')) {
    showCategoryDropdown.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // 初始化数据
  console.log('首页加载完成')
  console.log('文章总数:', stats.value.total)
  console.log('分类:', categories.value)
  console.log('热门文章:', popularPosts.value)
})

// 监听筛选条件变化
watch([selectedCategory, selectedTag, searchKeyword, sortBy], () => {
  resetToFirstPage()
})

// 监听页面变化
watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8f9fa;
  
}

/* 顶部横幅 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
  margin-bottom: 40px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}


.hero-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.search-box {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  width: 95%;
  padding: 16px 24px;
  padding-right: 50px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  outline: none;
  transition: all 0.3s;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.search-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 主要内容布局 */
.main-content {
  display: flex;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.container {
  flex: 1;
  min-width: 0;
}

/* 控制栏 */
.content-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-dropdown {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
  justify-content: space-between;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 100;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: none;
  border: none;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f8f9fa;
  color: #667eea;
}

.dropdown-item.active {
  background: #667eea;
  color: white;
}

.sort-select {
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s;
  min-width: 120px;
}

.sort-select:focus {
  outline: none;
  border-color: #667eea;
}

.view-control {
  display: flex;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #666;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
}

.view-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.view-btn.active {
  background: #667eea;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.create-post-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-post-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

/* 活跃筛选器 */
.active-filters {
  margin-bottom: 20px;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters-label {
  color: #666;
  font-size: 0.9rem;
  margin-right: 12px;
}

.filter-chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f0f2ff;
  color: #667eea;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.clear-chip {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.2);
  border: none;
  border-radius: 50%;
  color: #667eea;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: all 0.2s;
}

.clear-chip:hover {
  background: rgba(102, 126, 234, 0.3);
  transform: scale(1.1);
}

.clear-all {
  margin-left: 8px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all:hover {
  background: #f5f5f5;
  border-color: #999;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 0.9rem;
}

/* 文章列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* 文章卡片通用样式 */
.post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

/* 列表视图样式 */
.post-card.list-view {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.post-cover {
  flex: 0 0 200px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  height: 150px;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.post-card.list-view:hover .post-cover img {
  transform: scale(1.05);
}

.category-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.post-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.post-header {
  margin-bottom: 12px;
}

.post-title {
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #666;
  font-size: 0.85rem;
}

.post-excerpt {
  flex: 1;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  background: #f5f5f5;
  color: #666;
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tag:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #666;
  font-size: 0.85rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 0.9em;
}

.stat-number {
  font-weight: 500;
}

.post-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.edit-btn {
  background: #667eea;
  color: white;
}

.edit-btn:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.delete-btn {
  background: #f56565;
  color: white;
}

.delete-btn:hover {
  background: #e53e3e;
  transform: translateY(-1px);
}

/* 网格视图样式 */
.post-card.grid-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.post-cover-grid {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;
}

.post-cover-grid img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.post-card.grid-view:hover .post-cover-grid img {
  transform: scale(1.05);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.3));
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.post-content-grid {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.post-title-grid {
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-excerpt-grid {
  flex: 1;
  color: #666;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.9rem;
}

.post-meta-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.85rem;
  color: #666;
}

.meta-left, .meta-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 16px;
}

.tag-more {
  color: #999;
  font-size: 0.8rem;
  padding: 3px 8px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.3;
  color: #667eea;
}

.empty-state h3 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.empty-state p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1rem;
  line-height: 1.5;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.page-btn {
  padding: 10px 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.page-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.page-numbers {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.page-numbers .page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-numbers .page-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.page-numbers .page-btn.ellipsis {
  background: transparent;
  border-color: transparent;
  cursor: default;
  min-width: 20px;
  width: 20px;
}

.page-numbers .page-btn.ellipsis:hover {
  background: transparent;
  border-color: transparent;
  color: #333;
  transform: none;
}

.page-info {
  color: #666;
  font-size: 0.9rem;
  margin-left: auto;
}

/* 侧边栏 */
.sidebar {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 20px;
  height: fit-content;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.widget {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.widget-title {
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
  display: inline-block;
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
}

.hot-post:last-child {
  border-bottom: none;
}

.hot-post:hover {
  transform: translateX(4px);
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px;
  margin: 0 -8px;
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
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.category-item:hover {
  background: #f0f2ff;
  color: #667eea;
  transform: translateX(4px);
}

.category-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.category-count {
  font-size: 0.8rem;
  color: #999;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.category-item:hover .category-count {
  background: #d9dfff;
  color: #667eea;
}

/* 标签云 */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-cloud {
  display: inline-block;
  padding: 4px 10px;
  background: #f5f5f5;
  color: #666;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.tag-cloud:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
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
}

.recent-post:last-child {
  border-bottom: none;
}

.recent-post:hover {
  transform: translateX(4px);
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px;
  margin: 0 -8px;
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
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .sidebar {
    flex: none;
    width: 100%;
    position: static;
    max-height: none;
  }
  
  .hero-stats {
    gap: 30px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .content-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .create-post-btn {
    align-self: center;
  }
  
  .post-card.list-view {
    flex-direction: column;
  }
  
  .post-cover {
    flex: none;
    height: 200px;
  }
  
  .hero-stats {
    gap: 20px;
  }
  
  .stat-number {
    font-size: 1.8rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
  }
  
  .page-info {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-btn,
  .sort-select {
    width: 100%;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-stats {
    gap: 15px;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}
</style>