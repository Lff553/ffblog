import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { isLocalAccess } from '../utils/permission'

// 文章接口
export interface Post {
  id: number// 文章ID
  title: string// 文章标题
  content: string// 文章内容
  excerpt: string// 文章摘要
  date: string// 文章日期
  tags: string[]// 文章标签
  author: string// 文章作者
  views: number// 文章阅读量
  likes: number// 文章点赞量
  coverImage?: string// 文章封面图片
  category?: string// 文章分类
  createdAt: string// 文章创建时间
  updatedAt?: string// 文章更新时间
}

export const useBlogStore = defineStore('blog', () => {
  // 从 localStorage 加载初始数据
  const loadFromStorage = (): Post[] => {
    try {
      const stored = localStorage.getItem('blog-posts')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('加载存储失败:', error)
    }
    return []
  }

  // 保存到 localStorage
  const saveToStorage = (posts: Post[]) => {
    try {
      localStorage.setItem('blog-posts', JSON.stringify(posts))
    } catch (error) {
      console.error('保存到存储失败:', error)
    }
  }


  // 状态 - 从存储加载，如果没有则使用初始数据
  const storedPosts = loadFromStorage()
  const posts = ref<Post[]>(storedPosts.length > 0 ? storedPosts : [])
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 监听 posts 变化，自动保存
  watch(
    posts,
    (newPosts) => {
      saveToStorage(newPosts)
    },
    { deep: true }  // 深度监听，确保对象内部变化也会触发保存
  )

  // 获取所有文章的方法
  const getAllPosts = (options?: {
    includeDrafts?: boolean
    filterByCategory?: string
    filterByTag?: string
    searchKeyword?: string
    sortBy?: 'date' | 'views' | 'likes' | 'title'
    sortOrder?: 'asc' | 'desc'
  }): Post[] => {
    let filteredPosts = [...posts.value]
    
    const {
      filterByCategory,
      filterByTag,
      searchKeyword,
      sortBy = 'date',
      sortOrder = 'desc'
    } = options || {}
    
    // 1. 按分类过滤
    if (filterByCategory) {
      filteredPosts = filteredPosts.filter(post => 
        post.category?.toLowerCase() === filterByCategory.toLowerCase()
      )
    }
    
    // 2. 按标签过滤
    if (filterByTag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags.some(tag => 
          tag.toLowerCase().includes(filterByTag.toLowerCase())
        )
      )
    }
    
    // 3. 搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.excerpt.toLowerCase().includes(keyword) ||
        post.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
        post.author.toLowerCase().includes(keyword) ||
        post.category?.toLowerCase().includes(keyword)
      )
    }
    
    // 4. 排序
    filteredPosts.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
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
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    return filteredPosts
  }

  // 获取文章数量
  const getPostCount = (options?: {
    includeDrafts?: boolean
    filterByCategory?: string
    filterByTag?: string
  }): number => {
    return getAllPosts(options).length
  }
  
  // 获取最新的文章
  const getRecentPosts = (limit: number = 5): Post[] => {
    return getAllPosts({ sortBy: 'date', sortOrder: 'desc' }).slice(0, limit)
  }
  
  // 获取热门文章
  const getPopularPosts = (limit: number = 5): Post[] => {
    return getAllPosts({ sortBy: 'views', sortOrder: 'desc' }).slice(0, limit)
  }
  
  // 获取文章的所有分类
  const getAllCategories = (): Array<{ name: string; count: number }> => {
    const categories: Record<string, number> = {}
    
    getAllPosts().forEach(post => {
      if (post.category) {
        categories[post.category] = (categories[post.category] || 0) + 1
      }
    })
    
    return Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }
  
  // 获取所有标签
  const getAllTags = (): Array<{ name: string; count: number }> => {
    const tags: Record<string, number> = {}
    
    getAllPosts().forEach(post => {
      post.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1
      })
    })
    
    return Object.entries(tags)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }
  
  // 获取文章归档
  const getArchive = (): Array<{ year: number; month: number; count: number }> => {
    const archive: Record<string, number> = {}
    
    getAllPosts().forEach(post => {
      const date = new Date(post.date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const key = `${year}-${month.toString().padStart(2, '0')}`
      
      archive[key] = (archive[key] || 0) + 1
    })
    
    return Object.entries(archive)
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
  }
  
  // 按ID获取文章
  const getPostById = (id: number): Post | undefined => {
    return posts.value.find(post => post.id === id)
  }
  
  // 按标签获取文章
  const getPostsByTag = (tag: string): Post[] => {
    return getAllPosts({ filterByTag: tag })
  }
  
  // 按分类获取文章
  const getPostsByCategory = (category: string): Post[] => {
    return getAllPosts({ filterByCategory: category })
  }
  
  // 搜索文章
  const searchPosts = (keyword: string): Post[] => {
    return getAllPosts({ searchKeyword: keyword })
  }
  
  // 创建文章（需要本地权限）
  const createPost = (postData: Omit<Post, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>): Post | null => {
    if (!isLocalAccess()) {
      console.error('无权限创建文章')
      return null
    }
    
    const now = new Date().toISOString()
    const nextId = posts.value.length > 0 ? Math.max(...posts.value.map(post => post.id)) + 1 : 1
    const newPost: Post = {
      ...postData,
      id: nextId,
      views: 0,
      likes: 0,
      createdAt: now
    }
    
    posts.value.unshift(newPost)
    return newPost
  }
  
  // 更新文章（需要本地权限）
  const updatePost = (id: number, updates: Partial<Omit<Post, 'id'>>): boolean => {
    if (!isLocalAccess()) {
      console.error('无权限更新文章')
      return false
    }
    
    const index = posts.value.findIndex(post => post.id === id)
    if (index === -1) {
      return false
    }
    
    posts.value[index] = { 
      ...posts.value[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return true
  }
  
  // 删除文章（需要本地权限）
  const deletePost = (id: number): boolean => {
    if (!isLocalAccess()) {
      console.error('无权限删除文章')
      return false
    }
    
    const initialLength = posts.value.length
    posts.value = posts.value.filter(post => post.id !== id)
    return posts.value.length < initialLength
  }
  
  // 增加阅读量
  const incrementViews = (id: number): void => {
    const post = getPostById(id)
    if (post) {
      post.views++
    }
  }
  
  // 点赞文章
  const likePost = (id: number): void => {
    const post = getPostById(id)
    if (post) {
      post.likes++
    }
  }
  
  // 获取统计信息
  const getStats = () => {
    const allPosts = getAllPosts()

    return {
      total: allPosts.length,
      totalViews: allPosts.reduce((sum, post) => sum + post.views, 0),
      totalLikes: allPosts.reduce((sum, post) => sum + post.likes, 0),
      categories: getAllCategories().length,
      tags: getAllTags().length
    }
  }

  
  return {
    // 状态
    posts,
    isLoading,
    error,
    
    // 主要方法
    getAllPosts,
    getPostCount,
    getRecentPosts,
    getPopularPosts,
    getAllCategories,
    getAllTags,
    getArchive,
    
    // 单个文章操作
    getPostById,
    getPostsByTag,
    getPostsByCategory,
    searchPosts,
    
    // 文章管理
    createPost,
    updatePost,
    deletePost,
    incrementViews,
    likePost,
    
    // 统计和工具
    getStats
  }
})