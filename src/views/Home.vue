<template>
  <div class="home-page">
    <!-- 顶部横幅 -->
    <div class="hero-section">
      <div class="hero-content">
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
                {{ selectedCategory || '所有分类' }}
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
          </div>
          
          <!-- 创建按钮 -->
          <button
            @click="goToCreate"
            class="create-post-btn"
          >
            写文章
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
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>加载文章中...</p>
        </div>

        <!-- 文章内容 -->
        <div v-else>
          
          <!-- 网格视图 -->
          <div class="posts-grid">
            <article
              v-for="post in paginatedPosts"
              :key="post.id"
              class="post-card grid-view"
            >
              <!-- 内容 -->
              <div class="post-content-grid">
                <h3 class="post-title-grid" @click="viewPost(post.id)">{{ post.title }}</h3>
                
                <p class="post-excerpt-grid" @click="viewPost(post.id)">{{ post.excerpt }}</p>
                
                <!-- 元信息 -->
                <div class="post-meta-grid">
                  <div class="meta-left">
                    <span>📅 {{ formatDate(post.date) }}</span>
                  </div>
                  <div class="meta-right">
                    <span>👤 {{ post.author }}</span>
                  </div>
                </div>
                
                <!-- 统计 -->
                <div class="post-stats-grid">
                  <span class="stat">👁️ {{ post.views }}</span>
                  <span class="stat">❤️ {{ post.likes }}</span>
                </div>
                
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
                
                <!-- 操作按钮 -->
                <div class="post-actions">
                  <button
                    class="edit-btn"
                    @click.stop="editPost(post.id)"
                    title="编辑文章"
                  >
                    ✏️
                  </button>
                  <button
                    class="delete-btn"
                    @click.stop="deletePost(post.id)"
                    title="删除文章"
                  >
                    🗑️
                  </button>
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
import { useBlogStore } from '../stores/post'

const router = useRouter()
const blogStore = useBlogStore()

// 响应式数据
const sortBy = ref<'date' | 'views' | 'likes' | 'title'>('date')
const currentPage = ref(1)
const postsPerPage = ref(5)
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedTag = ref('')
const showCategoryDropdown = ref(false)
const isLoading = ref(false)

// 计算属性
const posts = computed(() => blogStore.posts)
const filteredPosts = computed(() => {
  let filtered = [...posts.value]
  
  // 1. 按分类过滤
  if (selectedCategory.value) {
    filtered = filtered.filter(post => 
      post.category?.toLowerCase() === selectedCategory.value.toLowerCase()
    )
  }
  
  // 2. 按标签过滤
  if (selectedTag.value) {
    filtered = filtered.filter(post => 
      post.tags.some(tag => 
        tag.toLowerCase().includes(selectedTag.value.toLowerCase())
      )
    )
  }
  
  // 3. 搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(keyword) ||
      post.content.toLowerCase().includes(keyword) ||
      post.excerpt.toLowerCase().includes(keyword) ||
      post.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
      post.author.toLowerCase().includes(keyword) ||
      post.category?.toLowerCase().includes(keyword)
    )
  }
  
  // 4. 排序
  filtered.sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy.value) {
      case 'date':
        aValue = new Date(a.date).getTime()
        bValue = new Date(b.date).getTime()
        break
      case 'views':
        aValue = a.views
        bValue = b.views
        break
      case 'likes':
        aValue = a.likes
        bValue = b.likes
        break
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      default:
        aValue = new Date(a.date).getTime()
        bValue = new Date(b.date).getTime()
    }
    
    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
  })
  
  return filtered
})

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage.value
  const end = start + postsPerPage.value
  return filteredPosts.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / postsPerPage.value)
})


// 分类
const categories = computed(() => {
  const catMap: Record<string, number> = {}
  posts.value.forEach(post => {
    if (post.category) {
      catMap[post.category] = (catMap[post.category] || 0) + 1
    }
  })
  return Object.entries(catMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

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
  router.push(`/issues/${id}`)
}

const editPost = (id: number) => {
  router.push(`/edit/${id}`)
}

const deletePost = async (id: number) => {
  if (!confirm('确定要删除这篇文章吗？此操作会将文章关闭，不可恢复。')) {
    return
  }
  
  try {
    const result = await blogStore.deletePost(id)
    
    if (result) {
      // 显示成功提示
      showSuccessMessage('文章删除成功！')
      
      // 检查是否需要调整页码
      if (filteredPosts.value.length === 0 && currentPage.value > 1) {
        currentPage.value--
      }
    } else {
      showErrorMessage('删除失败，请检查网络或权限')
    }
  } catch (error) {
    console.error('删除文章失败:', error)
    showErrorMessage('删除失败，请重试')
  }
}

// 添加成功/错误提示
const showSuccessMessage = (message: string) => {
  // 可以在这里添加一个 Toast 提示组件
  alert(message)
}

const showErrorMessage = (message: string) => {
  alert(message)
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
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  // 加载文章
  isLoading.value = true
  try {
    await blogStore.fetchPosts()
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    isLoading.value = false
  }
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

.search-box {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
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

/* 网格视图样式 */
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

.post-card.grid-view {
  display: flex;
  flex-direction: column;
  height: 100%;
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
  cursor: pointer;
  transition: color 0.2s;
}

.post-title-grid:hover {
  color: #667eea;
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
  cursor: pointer;
  transition: color 0.2s;
}

.post-excerpt-grid:hover {
  color: #333;
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

.post-stats-grid {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  color: #666;
}

.post-tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 16px;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  background: #f5f5f5;
  color: #666;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 0.8rem;
}

.tag:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.tag-more {
  color: #999;
  font-size: 0.8rem;
  padding: 3px 8px;
}

/* 操作按钮 */
.post-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  background: white;
}

.edit-btn {
  color: #1890ff;
  border-color: #91d5ff;
}

.edit-btn:hover {
  background: #e6f7ff;
  border-color: #1890ff;
  transform: translateY(-1px);
}

.delete-btn {
  color: #ff4d4f;
  border-color: #ffccc7;
}

.delete-btn:hover {
  background: #fff2f0;
  border-color: #ff4d4f;
  transform: translateY(-1px);
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .container {
    width: 100%;
  }
  
  .hero-stats {
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px;
  }
  
  .content-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .create-post-btn {
    align-self: center;
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
}
</style>